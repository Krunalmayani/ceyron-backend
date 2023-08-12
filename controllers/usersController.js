const { validationResult } = require("express-validator");
const connection = require("../db").promise();
const bcrypt = require("bcryptjs");
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

exports.usersRegister = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors });
    }

    const { name, email, phone_number, password, confirm_password, country } = req.body
    const hash_pass = await bcrypt.hash(password, 12);
    const theToken = generateToken(email)
    try {
        if (theToken) {
            if (password === confirm_password) {
                const [row] = await connection.execute("SELECT * FROM users WHERE `email`=? AND `phone_number`=? ", [email, phone_number]);
                if (row.length === 0) {
                    const [rows] = await connection.execute(
                        "INSERT INTO users( `name`, `email`,`phone_number`,`password`,`country`,`access_token`) VALUES(?,?,?,?,?,?)",
                        [name, email, phone_number, hash_pass, country, theToken]
                    );
                    if (rows.affectedRows === 1) {
                        const [col] = await connection.execute("SELECT * FROM users WHERE user_id=?", [rows.insertId]);
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

exports.updateUsers = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors });
    }
    const { user_id, name, email, phone_number, country } = req.body;

    const token = req?.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        }

        const [row] = await connection.execute("SELECT * FROM users WHERE `email`=? AND `phone_number`=? ", [email, phone_number]);
        if (row.length === 0) {
            const [rows] = await connection.execute("UPDATE users SET name=?,email=?,phone_number=?,country=? WHERE user_id=?", [name, email, phone_number, country, Number(user_id)])

            if (rows.affectedRows === 1) {
                const [row] = await connection.execute('select * from users WHERE user_id=?', [Number(user_id)])

                return res.json({ success: true, status: "success", message: 'Users successfully Update !', data: row[0] })
            } else {
                return res.json({ success: false, message: 'Not update !' })
            }
        } else {
            return res.json({ success: false, message: "The E-mail and Mobile Number already in use", });
        }


    } catch (error) {
        console.log('error:', error);
        return res.json({ success: false, error })
    }

}

exports.deleteUsers = async (req, res) => {

    const { user_id } = req.params;

    const token = req?.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        }
        const [rows] = await connection.execute("DELETE FROM users WHERE user_id=?", [user_id])


        if (rows.affectedRows === 1) {

            return res.json({ success: true, status: "success", message: 'Users successfully Delete !', data: user_id })
        } else {
            return res.json({ success: false, message: 'Not update !' })
        }
    } catch (error) {
        console.log('error:', error);
        return res.json({ success: false, error })
    }
}
