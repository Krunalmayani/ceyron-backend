const { validationResult } = require("express-validator");
const connection = require("../db").promise();
const bcrypt = require("bcryptjs");
const generateUniqueId = require('generate-unique-id');
const generateToken = require("../untils/generateToken");

exports.getAllUsers = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const token = req?.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        } else {


            const [row] = await connection.execute('select * from users')

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

exports.getUserById = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { id } = req.params;

    const token = req?.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        } else {


            const [row] = await connection.execute('select * from users where id=?', [id])

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

exports.usersLogin = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        const [row] = await connection.execute("SELECT * FROM users WHERE email=?", [email]);

        if (row.length === 0) {
            return res.json({ success: false, message: "Invalid Email Address", });
        } else {
            const passMatch = await bcrypt.compare(password, row[0].password);
            if (!passMatch) {
                return res.json({ success: false, message: "Incorrect password", });
            } else {
                const theToken = generateToken(email)
                if (theToken) {

                    const [rows] = await connection.execute("UPDATE users SET access_token =?  WHERE email=?", [theToken, email]);

                    const [cols] = await connection.execute("SELECT * FROM users WHERE `email`=?", [email]);

                    return res.status(200).json({ success: true, message: "Logged in successfully 😊", token: theToken, data: cols[0], status: "success" });
                } else {
                    return res.json({ success: false, message: "jwtToken not generate Please login again !", });
                }
            }

        }
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }

}

exports.usersRegister = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors });
    }

    const { name, email, phone_number, password, confirm_password, country, role } = req.body
    const hash_pass = await bcrypt.hash(password, 12);
    const theToken = generateToken(email)
    try {
        if (theToken) {
            if (password === confirm_password) {
                const [row] = await connection.execute("SELECT * FROM users WHERE `email`=? AND `phone_number`=? ", [email, phone_number]);
                if (row.length === 0) {
                    const users_id = generateUniqueId({ length: 10, useLetters: false });
                    const [rows] = await connection.execute(
                        "INSERT INTO users( `users_id`,`name`, `email`,`phone_number`,`password`,`country`,`role`,`access_token`) VALUES(?,?,?,?,?,?,?,?)",
                        [users_id, name, email, phone_number, hash_pass, country, role, theToken]
                    );
                    if (rows.affectedRows === 1) {
                        const [col] = await connection.execute("SELECT * FROM users WHERE id=?", [rows.insertId]);
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
                            message: "Feild Register Please Try Again !!!.",
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

exports.updateUsers = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors });
    }
    const { id } = req.params;
    const { name, email, phone_number, country } = req.body;

    const token = req?.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        }

        const [rows] = await connection.execute("UPDATE users SET name=?,email=?,phone_number=?,country=? WHERE id=?", [name, email, phone_number, country, id])

        if (rows.affectedRows === 1) {
            const [row] = await connection.execute('select * from users WHERE id=?', [id])

            return res.json({ success: true, status: "success", message: 'Users successfully Update !', data: row[0] })
        } else {
            return res.json({ success: false, message: 'Not update !' })
        }

    } catch (error) {
        return res.json({ success: false, error })
    }

}

exports.deleteUsers = async (req, res) => {

    const { id } = req.params;

    const token = req?.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        }
        const [rows] = await connection.execute("DELETE FROM users WHERE id=?", [id])


        if (rows.affectedRows === 1) {

            return res.json({ success: true, status: "success", message: 'Users successfully Delete !', data: id })
        } else {
            return res.json({ success: false, message: 'User Not Delete or User Not Found !' })
        }
    } catch (error) {
        return res.json({ success: false, error })
    }
}

exports.setSecurityPin = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors });
    }
    const { id, security_pin, confirm_security_pin } = req.body;
    const token = req?.headers?.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        }
        if (security_pin !== confirm_security_pin) {
            return res.json({ success: false, message: "Both Pin are not same!" });
        }
        const [row] = await connection.execute("SELECT * FROM users WHERE `id`=? ", [id]);
        if (row.length > 0) {
            const [rows] = await connection.execute("UPDATE users SET security_pin=? WHERE id=?", [security_pin, id]);
            if (rows.affectedRows === 1) {
                const [row] = await connection.execute('select * from users WHERE id=?', [id])

                return res.json({ success: true, status: "success", message: 'Pin successfully save!', data: row[0] })
            } else {
                return res.json({ success: false, message: 'Pin is Not Set!' })
            }
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
    const { id, old_password, new_password, confirm_password } = req.body;

    const token = req?.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        }
        if (new_password === confirm_password) {

            const [row] = await connection.execute("SELECT * FROM users WHERE id=?", [id]);

            if (row.length > 0) {

                const hash_old_pass = await bcrypt.compare(old_password, row[0]?.password);
                const hash_new_pass = await bcrypt.hash(new_password, 12);

                if (!hash_old_pass) {
                    return res.json({ success: false, message: "Incorrect old password" });
                } else {
                    const [val] = await connection.execute("UPDATE users SET password=?  WHERE id=?", [hash_new_pass, id]);
                    return res.json({ success: true, status: "success", message: "New password has been succesfully updated !", });
                }
            } else {
                return res.json({ success: false, message: "User ID is NOT Found" });
            }
        } else {
            return res.json({ success: false, message: "New Password and Old Password are not match" });
        }
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}