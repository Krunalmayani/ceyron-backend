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

            const [row] = await connection.execute("SELECT t.id,t.transaction_id,t.sender_id,sender.name AS sender_name,t.receiver_id,receiver.name AS receiver_name,t.transaction_type, t.amount, t.transaction_date, t.final_amount, t.amount_to_collect,t.transaction_status,t.admin_charge,t.agent_charge,t.note FROM transactions t INNER JOIN users sender on t.sender_id = sender.users_id INNER JOIN users receiver ON t.receiver_id = receiver.users_id")

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

    const { sender_id, receiver_id, amount, transaction_type, final_amount, note, amount_to_collect, admin_charge, agent_charge } = req.body;
    const token = req?.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        }

        const [senderRole] = await connection.execute('select * from users where users_id=?', [sender_id]);
        const [receiverRole] = await connection.execute('select * from users where users_id=?', [receiver_id]);
        const [settings] = await connection.execute('select * from global_settings');

        if (senderRole.length === 0) {
            return res.json({ success: false, message: "Sender ID is invalid !", });
        }

        if (receiverRole.length === 0) {
            return res.json({ success: false, message: "Receiver ID is invalid !", });
        }

        const sender_balance = senderRole[0].balance;
        const adminCharge = (Number(amount) * Number(settings[0].admin_charge)) / 100; // Example: 1% fee
        const agentCharge = (Number(amount) * Number(settings[0].agent_charge)) / 100;// Example: 1% fee
        const netAmount = Number(amount) + adminCharge;
        const collectAmount = agentCharge + adminCharge + Number(amount);

        if (netAmount !== Number(final_amount)) {
            return res.json({ success: false, message: "Final Amount is Mismatched  !", });
        }

        if (Number(amount_to_collect) !== Number(collectAmount)) {
            return res.json({ success: false, message: "Mismatch amount to be collect", });
        }

        if (sender_balance < netAmount) {
            return res.json({ success: false, message: "Insufficient balance. !", });
        }

        if (senderRole[0].role === 'Agent' && receiverRole[0].role === "User") {
            const [sender] = await connection.execute("UPDATE users SET balance = balance - ? WHERE users_id=?", [netAmount, sender_id]);

            if (sender.affectedRows !== 1) {
                res.json({ success: false, message: 'Error deducting balance.' });
            }

            const [receiver] = await connection.execute("UPDATE users SET balance = balance + ? WHERE users_id=?", [Number(amount), receiver_id]);
            if (receiver.affectedRows !== 1) {
                res.json({ success: false, message: 'Error adding balance.' });
            }

            const transaction_id = generateUniqueId({ length: 18, });

            const [row] = await connection.execute(
                "INSERT INTO transactions(`transaction_id`,`sender_id`,`receiver_id`,`transaction_type`,`amount`, `final_amount`,`note`,`amount_to_collect`,`transaction_status`,`agent_charge`,`admin_charge` ) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
                [transaction_id, sender_id, receiver_id, transaction_type, amount, final_amount, note, collectAmount, 'success', admin_charge, agent_charge]
            );

            if (row.affectedRows === 1) {
                const [col] = await connection.execute('SELECT t.id,t.transaction_id,t.sender_id,sender.name AS sender_name,t.receiver_id,receiver.name AS receiver_name,t.transaction_type, t.amount,t.transaction_fees, t.transaction_date, t.final_amount, t.amount_to_collect,t.admin_charge,t.agent_charge,t.transaction_status,t.note FROM transactions t INNER JOIN users sender on t.sender_id = sender.users_id INNER JOIN users receiver ON t.receiver_id = receiver.users_id where t.id=?', [row.insertId]);
                return res.json({ success: true, status: 'success', data: col[0], message: 'Successfully Transfer!', });
            } else {
                return res.json({ success: false, message: "Data Not Inserted Found !" });
            }
        } else {
            return res.json({ success: false, message: "Sender is not Agent OR Receiver is not User !" });
        }
    } catch (error) {
        return res.json({ success: false, error })
    }
}