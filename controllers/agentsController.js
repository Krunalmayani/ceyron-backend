
const { validationResult } = require("express-validator");
const connection = require("../db").promise();
const bcrypt = require("bcryptjs");
const generateUniqueId = require('generate-unique-id');
const generateToken = require("../untils/generateToken");


exports.getAllAgents = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const token = req?.headers?.authorization?.split(" ")[1];
    ;
    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        }
        const [row] = await connection.execute('select * from agents')

        if (row.length > 0) {
            return res.json({ data: row, success: true, status: "success", })
        } else {
            return res.json({ success: false, message: "Unauthorized accress !" });
        }

    } catch (error) {
        return res.json({ success: false, error })
    }
}

exports.agentsLogin = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { agents_id, phone_number, password } = req.body;
    try {
        const [row] = await connection.execute("SELECT * FROM agents WHERE `agents_id`=? AND phone_number=?", [agents_id, phone_number]);

        if (row.length === 0) {
            return res.json({ success: false, message: "Invalid Mobile Number or agents ID", });
        } else {
            const passMatch = await bcrypt.compare(password, row[0].password);
            if (!passMatch) {
                return res.json({ success: false, message: "Incorrect password", });
            } else {
                const theToken = generateToken(agents_id)
                if (theToken) {

                    const [rows] = await connection.execute("UPDATE agents SET access_token =?  WHERE agents_id=?", [theToken, agents_id]);

                    const [cols] = await connection.execute("SELECT * FROM agents WHERE `agents_id`=?", [agents_id]);

                    return res.status(200).json({ success: true, message: "Logged in successfully 😊", token: theToken, agent: cols[0], status: "success" });
                } else {
                    return res.json({ success: false, message: "jwtToken not generate Please login again !", });
                }
            }

        }
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }

}

exports.agentsRegister = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors });
    }

    const { name, business_name, branch_name, email, phone_number, password, confirm_password, country } = req.body
    const hash_pass = await bcrypt.hash(password, 12);
    const theToken = generateToken(email)
    try {
        if (theToken) {
            if (password === confirm_password) {
                const [row] = await connection.execute("SELECT * FROM agents WHERE `email`=? AND `phone_number`=? ", [email, phone_number]);
                if (row.length === 0) {
                    const agents_id = generateUniqueId({ length: 10, useLetters: false });
                    const [rows] = await connection.execute(
                        "INSERT INTO agents(`agents_id`,`name`,`business_name`,`branch_name`,`email`,`phone_number`,`password`,`country`,`access_token`) VALUES(?,?,?,?,?,?,?,?,?)",
                        [agents_id, name, business_name, branch_name, email, phone_number, hash_pass, country, theToken]
                    );
                    if (rows.affectedRows === 1) {
                        const [col] = await connection.execute("SELECT * FROM agents WHERE id=?", [rows.insertId]);
                        return res.json({
                            success: true,
                            status: "success",
                            message: "Successfully Register...",
                            data: col[0],
                            token: theToken,
                        });
                    } else {
                        return res.json({
                            success: false,
                            message: "Feild Register !!!.",
                        });
                    }
                } else {
                    return res.json({ success: false, message: "The E-mail and Mobile Number already in use", });
                }
            } else {
                return res.json({ success: false, message: "Both Password is not Match" });
            }
        } else {
            return res.json({ success: false, message: "jwtToken not generate Please try again !", });
        }

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }

}

exports.updateAgents = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors });
    }
    const { id, agents_id, name, business_name, branch_name, email, phone_number, country } = req.body

    const token = req?.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        }
        const [rows] = await connection.execute("UPDATE agents SET agents_id=?, name=?, business_name=?, branch_name=?, email=?, phone_number=?,country=? WHERE id=?", [agents_id, name, business_name, branch_name, email, phone_number, country, id])
        if (rows.affectedRows === 1) {
            const [row] = await connection.execute('select * from agents WHERE id=?', [id])

            return res.json({ success: true, status: "success", message: 'Agents successfully Update !', data: row[0] })
        } else {
            return res.json({ success: false, message: 'Not update !' })
        }
    } catch (error) {
        return res.json({ success: false, error })
    }

}

exports.deleteAgents = async (req, res) => {

    const { id } = req.params;

    const token = req?.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        }
        const [rows] = await connection.execute("DELETE FROM agents WHERE id=?", [id])


        if (rows.affectedRows === 1) {

            return res.json({ success: true, status: "success", message: 'Agents successfully Delete !', data: id })
        } else {
            return res.json({ success: false, message: 'Not update !' })
        }
    } catch (error) {
        console.log('error:', error);
        return res.json({ success: false, error })
    }
}

exports.forgotPassword = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { phone_no } = req.body;
    try {
        const [row] = await connection.execute("SELECT * FROM agents WHERE phone_no=?", [phone_no]);

        if (row.length === 0) {
            return res.json({ success: false, message: "Invalid Mobile Number  ", });
        } else {
            //  otp valu baki
            return res.status(200).json({
                success: true,
                message: "Logged in successfully 😊",
                status: "success"
            });
        }
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}


exports.checkOTP = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { otp } = req.body;
    try {
        const [row] = await connection.execute("SELECT * FROM agents WHERE `otp`=? ", [otp]);

        if (row.length === 0) {
            return res.json({ success: false, message: "Invalid OTP", });
        } else {
            return res.status(200).json({
                success: true,
                message: "OTP is Valid",
                status: "success"
            });
        }
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}


exports.setNewPassword = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { agents_id, new_password, confirm_password } = req.body;

    const hash_pass = await bcrypt.hash(new_password, 12);

    try {
        if (new_password === confirm_password) {

            const [row] = await connection.execute("SELECT * FROM agents WHERE agents_id=?", [agents_id]);

            if (row.length > 0) {
                const [rows] = await connection.execute("UPDATE agents SET password=?  WHERE agents_id=?", [hash_pass, agents_id]);

                if (rows.affectedRows === 1) {
                    return res.json({ success: true, status: "success", message: "Password reset successful, you can now login with the new password" });
                } else {
                    return res.json({ success: false, message: "Password not Set !" });
                }

            } else {
                return res.json({ success: false, message: "Agent ID not found !" });
            }
        } else {
            return res.json({ success: false, message: "Both Password is not Match" });
        }
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}


exports.changePassword = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { agents_id, old_password, new_password, confirm_password } = req.body;

    const token = req?.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        }
        if (new_password === confirm_password) {

            const [row] = await connection.execute("SELECT * FROM agents WHERE agents_id=?", [agents_id]);

            if (row.length > 0) {

                const hash_old_pass = await bcrypt.compare(old_password, row[0]?.password);
                const hash_new_pass = await bcrypt.hash(new_password, 12);

                if (!hash_old_pass) {
                    return res.json({ success: false, message: "Incorrect old password" });
                } else {
                    const [val] = await connection.execute("UPDATE agents SET password=?  WHERE agents_id=?", [hash_new_pass, agents_id]);
                    return res.json({ status: 200, success: true, status: "success", message: "New password has been succesfully updated !", });
                }
            } else {
                return res.json({ success: false, message: "Agents ID  is NOT Found" });
            }
        } else {
            return res.json({ success: false, message: "New Password and Old Password are not match" });
        }
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}
