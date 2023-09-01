const { validationResult } = require("express-validator");
const connection = require("../db").promise();
const bcrypt = require("bcryptjs");
const generateToken = require("../untils/generateToken");
const generateUniqueId = require("generate-unique-id");


exports.register = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { name, email, phone_number, password } = req.body;

    try {
        const [row] = await connection.execute("SELECT * FROM users WHERE `email`=?", [email]);
        if (row.length > 0) {
            return res.json({ success: false, message: "The E-mail already in use", });
        } else {
            const hash_pass = await bcrypt.hash(password, 12);
            const theToken = generateToken(email)
            const admin_id = generateUniqueId({ length: 10, useLetters: false });
            const [rows] = await connection.execute(
                "INSERT INTO users(`users_id`,`name`,`email`,`phone_number`,`password`,`role`,`access_token`) VALUES(?,?,?,?,?,?,?)",
                [admin_id, name, email, phone_number, hash_pass, 'Admin', theToken]
            );
            if (rows.affectedRows === 1) {
                const [col] = await connection.execute("SELECT * FROM users WHERE email=?", [email]);
                return res.json({
                    success: true,
                    status: 'success',
                    token: theToken,
                    message: "The user has been successfully inserted...",
                    user: col[0],
                });
            } else {
                return res.json({
                    success: false,
                    message: "The user has been not inserted !!!.",
                });
            }
        }
    } catch (error) {
        return res.json({ success: false, error })
    }

};

exports.login = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    try {
        const [row] = await connection.execute("SELECT * FROM users WHERE `email`=?", [email]);

        if (row.length === 0) {
            return res.json({ success: false, message: "Invalid email address", });
        } else {
            const passMatch = await bcrypt.compare(password, row[0].password);
            if (!passMatch) {
                return res.json({ success: false, message: "Incorrect password", });
            } else {
                const theToken = generateToken(email);
                if (theToken) {

                    const [rows] = await connection.execute("UPDATE users SET access_token =?  WHERE email=?", [theToken, email]);

                    const [cols] = await connection.execute("SELECT * FROM users WHERE `email`=?", [email]);

                    return res.status(200).json({
                        success: true,
                        message: "Logged in successfully 😊",
                        token: theToken,
                        user: cols[0],
                        status: "success"
                    });
                } else {
                    return res.json({ success: false, message: "jwtToken not generate Please login again !", });
                }
            }

        }
    } catch (error) {
        return res.json({ success: false, error })
    }

};


exports.forgotPassword = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { email } = req.body;
    try {
        const [row] = await connection.execute("SELECT * FROM users WHERE email=?", [email]);

        if (row.length === 0) {
            return res.json({ success: false, message: "Invalid Email addres  ", });
        } else {
            //  otp valu baki
            return res.status(200).json({
                success: true,
                message: "Logged in successfully 😊",
                status: "success"
            });
        }
    } catch (error) {
        return res.json({ success: false, error })
    }
}


exports.setNewPassword = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { email, new_password, confirm_password } = req.body;

    const hash_pass = await bcrypt.hash(new_password, 12);

    try {
        if (new_password === confirm_password) {

            const [row] = await connection.execute("SELECT * FROM users WHERE email=?", [email]);

            if (row.length > 0) {
                const [rows] = await connection.execute("UPDATE users SET password=?  WHERE email=?", [hash_pass, email]);

                if (rows.affectedRows === 1) {
                    return res.json({ success: true, status: "success", message: "Password reset successful, you can now login with the new password" });
                } else {
                    return res.json({ success: false, message: "Password not Set !" });
                }

            } else {
                return res.json({ success: false, message: "Email not found !" });
            }
        } else {
            return res.json({ success: false, message: "Both Password is not Match" });
        }
    } catch (error) {
        return res.json({ success: false, error })
    }
}


exports.changePassword = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { email, old_password, new_password, confirm_password } = req.body;
    const token = req?.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        }
        if (new_password === confirm_password) {

            const [row] = await connection.execute("SELECT * FROM users WHERE email=?", [email]);

            if (row.length > 0) {

                const hash_old_pass = await bcrypt.compare(old_password, row[0]?.password);
                const hash_new_pass = await bcrypt.hash(new_password, 12);

                if (!hash_old_pass) {
                    return res.json({ success: false, message: "Incorrect old password" });
                } else {
                    const [val] = await connection.execute("UPDATE users SET password=?  WHERE email=?", [hash_new_pass, email]);
                    return res.json({ status: "success", success: true, message: "New password has been succesfully updated !", });
                }
            } else {
                return res.json({ success: false, message: "Email  is NOT Found" });
            }
        } else {
            return res.json({ success: false, message: "New Password and Old Password are not match" });
        }
    } catch (error) {
        return res.json({ success: false, error })
    }
}

exports.updateGlobalSettings = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { id, agent_charged, admin_charged } = req.body;
    const token = req?.headers?.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        }

        const [rows] = await connection.execute(
            "UPDATE global_settings SET admin_charge=?,agent_charge=? WHERE id=?",
            [admin_charged, agent_charged, Number(id)]
        )

        if (rows.affectedRows === 1) {
            const [row] = await connection.execute('select * from global_settings WHERE id=?', [Number(id)])

            return res.json({ success: true, status: "success", message: 'Settings successfully Update !', data: row[0] })
        } else {
            return res.json({ success: false, message: 'Not update Settings !' })
        }

    } catch (error) {
        return res.json({ success: false, error })
    }
}

exports.TransferAmountToAgent = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { sender_id, receiver_id, amount, transaction_type, note, } = req.body;
    const token = req?.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        }

        const [senderRole] = await connection.execute('select * from users where users_id=?', [sender_id]);
        const [receiverRole] = await connection.execute('select * from users where users_id=?', [receiver_id]);

        if (senderRole[0].balance < amount) {
            return res.json({ success: false, message: "Insufficient balance. !", });
        }

        if (senderRole.length === 0) {
            return res.json({ success: false, message: "Sender ID is invalid !", });
        }

        if (receiverRole.length === 0) {
            return res.json({ success: false, message: "Receiver ID is invalid !", });
        }

        if (senderRole[0].role === 'Admin' && receiverRole[0].role === "Agent") {
            const [sender] = await connection.execute("UPDATE users SET balance = balance - ? WHERE users_id=?", [Number(amount), sender_id]);

            if (sender.affectedRows !== 1) {
                res.json({ success: false, message: 'Error deducting balance.' });
            }

            const [receiver] = await connection.execute("UPDATE users SET balance = balance + ? WHERE users_id=?", [Number(amount), receiver_id]);
            if (receiver.affectedRows !== 1) {
                res.json({ success: false, message: 'Error adding balance.' });
            }

            const transaction_id = generateUniqueId({ length: 18, });

            const [row] = await connection.execute(
                "INSERT INTO transactions(`transaction_id`,`sender_id`,`receiver_id`,`transaction_type`,`amount`, `final_amount`,`note`,`amount_to_collect`,`transaction_status` ) VALUES(?,?,?,?,?,?,?,?,?)",
                [transaction_id, sender_id, receiver_id, transaction_type, amount, amount, note, 0, 'success']
            );

            if (row.affectedRows === 1) {
                const [col] = await connection.execute('SELECT t.id,t.transaction_id,t.sender_id,sender.name AS sender_name,t.receiver_id,receiver.name AS receiver_name,t.transaction_type, t.amount,t.transaction_fees, t.transaction_date, t.final_amount, t.amount_to_collect,t.transaction_status,t.note FROM transactions t INNER JOIN users sender on t.sender_id = sender.users_id INNER JOIN users receiver ON t.receiver_id = receiver.users_id where t.id=?', [row.insertId]);
                return res.json({ success: true, status: 'success', data: col[0], message: 'Successfully Transfer!', });
            } else {
                return res.json({ success: false, message: "Data Not Inserted Found !" });
            }
        } else {
            return res.json({ success: false, message: "Sender is not Admin OR Receiver is not Agent !" });
        }
    } catch (error) {
        return res.json({ success: false, error })
    }
}