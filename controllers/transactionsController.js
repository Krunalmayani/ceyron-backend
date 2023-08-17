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

            const [row] = await connection.execute('select * from transactions')

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
    const { sender_id, receiver_id, amount, transaction_fees, transaction_type, final_amount, note } = req.body;
    const token = req?.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        }

        const [rows] = await connection.execute('select name,balance from users where users_id=?', [sender_id]);
        const [cols] = await connection.execute('select name,balance from users where users_id=?', [receiver_id]);

        if (rows.length === 0) {
            return res.json({ success: false, message: "Sender ID is invalid !", });
        }
        if (cols.length === 0) {
            return res.json({ success: false, message: "Receiver ID is invalid !", });
        }
        const sender_balance = rows[0].balance;

        if (sender_balance < amount) {
            return res.json({ success: false, message: "Insufficient balance. !", });
        }

        const transactionFee = (amount * transaction_fees) / 100; // Example: 1% fee
        const netAmount = amount - transactionFee;

        const [sender] = await connection.execute("UPDATE users SET balance = balance - ? WHERE users_id=?", [amount, sender_id]);

        if (sender.affectedRows !== 1) {
            res.json({ success: false, message: 'Error deducting balance.' });
        }

        const [receiver] = await connection.execute("UPDATE users SET balance = balance + ? WHERE users_id=?", [netAmount, receiver_id]);
        if (receiver.affectedRows !== 1) {
            res.json({ success: false, message: 'Error adding balance.' });
        }
        const transaction_id = generateUniqueId({ length: 18, });

        const [row] = await connection.execute(
            "INSERT INTO transactions(`transaction_id`,`sender_name`,`receiver_name`,`transaction_type`,`amount`,`transaction_fees`,`final_amount`,`note` ) VALUES(?,?,?,?,?,?,?,? )",
            [transaction_id, rows[0].name, cols[0].name, transaction_type, amount, transaction_fees, final_amount, note]
        );

        if (row.affectedRows === 1) {
            const [col] = await connection.execute('select *  from transactions where id=?', [row.insertId]);
            return res.json({ success: true, status: 'success', data: col[0] });
        } else {
            return res.json({ success: false, message: "Data Not Inserted Found !" });
        }

    } catch (error) {

        return res.json({ success: false, error })
    }
}