const { validationResult } = require("express-validator");
const connection = require("../db").promise();

const generateUniqueId = require('generate-unique-id');


exports.getAllTransactions = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const token = req?.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        } else {

            const [row] = await connection.execute("SELECT t.id,t.transaction_id,t.sender_id,sender.name AS sender_name,sender.role AS sender_role, t.receiver_id,receiver.name AS receiver_name, receiver.role AS receiver_role,t.transaction_type, t.amount, t.transaction_date, t.final_amount, t.amount_to_collect, t.transaction_status, t.admin_charge, t.agent_charge, t.note, t.debit_amount FROM transactions t INNER JOIN users sender on t.sender_id = sender.users_id INNER JOIN users receiver ON t.receiver_id = receiver.users_id")

            if (row.length > 0) {
                return res.json({ data: row, success: true, status: 'success' })
            } else {
                return res.json({ success: false, message: "Data Not Found !" });
            }
        }
    } catch (error) {
        return res.json({ success: false, error })
    }
}


exports.TransferAmount = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { sender_id, receiver_id, amount, transaction_type, note, final_amount, amount_to_collect, admin_charge, agent_charge, debit_amount } = req.body;
    const token = req?.headers?.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        }

        const [senderRole] = await connection.execute('select * from users where users_id=?', [sender_id]);
        const [receiverRole] = await connection.execute('select * from users where users_id=?', [receiver_id]);
        const [settings] = await connection.execute('select * from global_settings where charge_type=?', [transaction_type]);

        if (settings.length === 0) {
            return res.json({ success: false, message: "Transaction Type is not valid... !" });
        }
        if (Number(settings[0].admin_charge) !== Number(admin_charge)) {
            return res.json({ success: false, message: "Admin Commission is not valid... !" });
        }
        if (Number(settings[0].agent_charge) !== Number(agent_charge)) {
            return res.json({ success: false, message: "Agent Fees  not valid... !" });
        }

        if (senderRole.length === 0) {
            return res.json({ success: false, message: "Sender ID is invalid !", });
        }

        if (receiverRole.length === 0) {
            return res.json({ success: false, message: "Receiver ID is invalid !", });
        }

        const sender_balance = senderRole[0].balance;


        const adminCharge = ((Number(amount) * Number(settings[0].admin_charge)) / 100).toFixed(2);   // Example: 1% fee
        const agentCharge = ((Number(amount) * Number(settings[0].agent_charge)) / 100).toFixed(2);   // Example: 1% fee

        let sender_query = "UPDATE users SET balance = balance - ? WHERE users_id=?";
        let receiver_query = "UPDATE users SET balance = balance + ? WHERE users_id=?";
        let select_query = "SELECT t.id,t.transaction_id,t.sender_id,sender.name AS sender_name,t.receiver_id,receiver.name AS receiver_name,t.transaction_type, t.amount,t.transaction_fees, t.transaction_date, t.final_amount, t.amount_to_collect,t.admin_charge,t.agent_charge,t.transaction_status,t.note,t.debit_amount FROM transactions t INNER JOIN users sender on t.sender_id = sender.users_id INNER JOIN users receiver ON t.receiver_id = receiver.users_id where t.id=?";
        let insert_query = "INSERT INTO transactions(`transaction_id`,`sender_id`,`receiver_id`,`transaction_type`,`amount`, `final_amount`,`note`,`amount_to_collect`,`transaction_status`,`agent_charge`,`admin_charge`,`debit_amount` ) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)";

        if (transaction_type === 'agent_to_agent') {
            if (senderRole[0].role === 'Agent' && receiverRole[0].role === "Agent") {
                const agentdebited = Number(amount) + Number(adminCharge);
                // user to user transfer charges

                if (Number(agentdebited) !== Number(final_amount)) {
                    return res.json({ success: false, message: "Final Transfer Amount is Mismatched  !", });
                }
                const [sender] = await connection.execute(sender_query, [agentdebited, sender_id]);

                if (sender.affectedRows !== 1) {
                    res.json({ success: false, message: 'Error deducting balance.' });
                }

                const [receiver] = await connection.execute(receiver_query, [Number(amount), receiver_id]);
                if (receiver.affectedRows !== 1) {
                    res.json({ success: false, message: 'Error adding balance.' });
                }

                const transaction_id = generateUniqueId({ length: 18, });
                const [row] = await connection.execute(
                    insert_query,
                    [transaction_id, sender_id, receiver_id, transaction_type, Number(amount), agentdebited, note, 0, 'success', 0, settings[0].admin_charge, 0]
                );

                if (row.affectedRows === 1) {
                    const [col] = await connection.execute(select_query, [row.insertId]);
                    return res.json({ success: true, status: 'success', data: col[0], message: 'Successfully Transfer!', });
                } else {
                    return res.json({ success: false, message: "Data Not Inserted Found !" });
                }
            }
            else {
                return res.json({ success: false, message: "Sender OR Receiver is not Agent !" });
            }
        } else if (transaction_type === 'agent_to_user') {
            if (senderRole[0].role === 'Agent' && receiverRole[0].role === "User") {
                // aget to user transfer charges
                const chrages = (Number(agentCharge) + Number(adminCharge)).toFixed(2)
                const agentdebited = Number(amount) + Number(adminCharge);
                const agentCollectAmount = Number(chrages) + Number(amount);

                if (Number(agentdebited) !== Number(final_amount)) {
                    return res.json({ success: false, message: "Final Amount is Mismatched  !", });
                }

                if (Number(sender_balance) < Number(agentdebited)) {
                    return res.json({ success: false, message: "Insufficient balance. !", });
                }

                if (Number(amount_to_collect) !== Number(agentCollectAmount)) {
                    return res.json({ success: false, message: "Mismatch amount to be collect", });
                }

                const [sender] = await connection.execute(sender_query, [agentdebited, sender_id]);

                if (sender.affectedRows !== 1) {
                    res.json({ success: false, message: 'Error deducting balance.' });
                }

                const [receiver] = await connection.execute(receiver_query, [Number(amount), receiver_id]);
                if (receiver.affectedRows !== 1) {
                    res.json({ success: false, message: 'Error adding balance.' });
                }

                const transaction_id = generateUniqueId({ length: 18, });
                const [row] = await connection.execute(
                    insert_query,
                    [transaction_id, sender_id, receiver_id, transaction_type, Number(amount), agentdebited, note, agentCollectAmount, 'success', agent_charge, admin_charge, 0]
                );

                if (row.affectedRows === 1) {
                    const [col] = await connection.execute(select_query, [row.insertId]);
                    return res.json({ success: true, status: 'success', data: col[0], message: 'Successfully Transfer!', });
                } else {
                    return res.json({ success: false, message: "Data Not Inserted Found !" });
                }

            } else {
                return res.json({ success: false, message: "Data Not Inserted Found !" });
            }

        } else if (transaction_type === 'user_to_agent') {
            if (senderRole[0].role === 'User' && receiverRole[0].role === "Agent") {
                // user to agent transfer charges
                const chrages = (Number(agentCharge) + Number(adminCharge)).toFixed(2)
                const userdeduction = Number(amount) + Number(chrages);
                const agentdeposite = Number(amount) + Number(agentCharge);

                console.log('Number(agentdeposite)', Number(agentdeposite));
                console.log('Number(final_amount)', Number(final_amount));

                console.log('Number(userdeduction)', Number(userdeduction));
                console.log('Number(debit_amount)', Number(debit_amount));

                console.log('Number(agentCharge)', Number(agentCharge));
                console.log('Number(adminCharge)', Number(adminCharge));

                console.log('Number', Number(amount), Number(agentCharge), Number(adminCharge));
                console.log('charge', Number(amount), chrages, Number(agentCharge) + Number(adminCharge));

                if (Number(agentdeposite) !== Number(final_amount)) {
                    return res.json({ success: false, message: "Final Transfer Amount Mismatched  !", });
                }
                if (Number(userdeduction) !== Number(debit_amount)) {
                    return res.json({ success: false, message: "Debited Amount Mismatched  !", });
                }
                if (Number(sender_balance) < Number(userdeduction)) {
                    return res.json({ success: false, message: "Insufficient balance. !", });
                }

                const [sender] = await connection.execute(sender_query, [userdeduction, sender_id]);

                if (sender.affectedRows !== 1) {
                    res.json({ success: false, message: 'Error deducting balance.' });
                }

                const [receiver] = await connection.execute(receiver_query, [agentdeposite, receiver_id]);
                if (receiver.affectedRows !== 1) {
                    res.json({ success: false, message: 'Error adding balance.' });
                }

                const transaction_id = generateUniqueId({ length: 18, });
                const [row] = await connection.execute(
                    insert_query,
                    [transaction_id, sender_id, receiver_id, transaction_type, Number(amount), agentdeposite, note, 0, 'success', agent_charge, admin_charge, userdeduction]
                );

                if (row.affectedRows === 1) {
                    const [col] = await connection.execute(select_query, [row.insertId]);
                    return res.json({ success: true, status: 'success', data: col[0], message: 'Successfully Transfer!', });
                } else {
                    return res.json({ success: false, message: "Data Not Inserted Found !" });
                }

            } else {
                return res.json({ success: false, message: "Sender is not User OR Receiver is not Agent !" });
            }
        } else if (transaction_type === 'user_to_user') {
            if (senderRole[0].role === 'User' && receiverRole[0].role === "User") {

                // user to user transfer charges
                const userdebited = Number(amount) + Number(adminCharge);

                if (Number(userdebited) !== Number(final_amount)) {
                    return res.json({ success: false, message: "Final Transfer Amount is Mismatched  !", });
                }
                const [sender] = await connection.execute(sender_query, [userdebited, sender_id]);

                if (sender.affectedRows !== 1) {
                    res.json({ success: false, message: 'Error deducting balance.' });
                }

                const [receiver] = await connection.execute(receiver_query, [Number(amount), receiver_id]);
                if (receiver.affectedRows !== 1) {
                    res.json({ success: false, message: 'Error adding balance.' });
                }

                const transaction_id = generateUniqueId({ length: 18, });
                const [row] = await connection.execute(
                    insert_query,
                    [transaction_id, sender_id, receiver_id, transaction_type, Number(amount), userdebited, note, 0, 'success', 0, settings[0].admin_charge, 0]
                );

                if (row.affectedRows === 1) {
                    const [col] = await connection.execute(select_query, [row.insertId]);
                    return res.json({ success: true, status: 'success', data: col[0], message: 'Successfully Transfer!', });
                } else {
                    return res.json({ success: false, message: "Data Not Inserted Found !" });
                }
            }
            else {
                return res.json({ success: false, message: "Sender OR Receiver is not User !" });
            }

        } else {
            return res.json({ success: false, message: "Transaction Type is not valid !" });
        }

    } catch (error) {
        console.log('error :', error);
        return res.json({ success: false, error })
    }
}

