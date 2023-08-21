
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
    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        } else {


            const [row] = await connection.execute('select * from users where role=?', ['Agent']);

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

exports.getAgentById = async (req, res) => {
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


            const [row] = await connection.execute('select * from users where id=? AND role=?', [id, 'Agent'])

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
exports.getAgentByUserId = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { users_id } = req.params;

    const token = req?.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        } else {


            const [row] = await connection.execute('select * from users where users_id=? AND role=?', [users_id, 'Agent'])

            if (row.length > 0) {
                return res.json({ data: row[0], success: true, status: 'success' })
            } else {
                return res.json({ success: false, message: "Data Not Found !" });
            }
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
        const [row] = await connection.execute("SELECT * FROM users WHERE `users_id`=? AND phone_number=?", [agents_id, phone_number]);

        if (row.length === 0) {
            return res.json({ success: false, message: "Invalid Mobile Number or agents ID" });
        } else {
            const passMatch = await bcrypt.compare(password, row[0].password);
            if (!passMatch) {
                return res.json({ success: false, message: "Incorrect password", });
            } else {
                const theToken = generateToken(agents_id)
                if (theToken) {

                    const [rows] = await connection.execute("UPDATE users SET access_token =?  WHERE users_id=?", [theToken, agents_id]);

                    const [cols] = await connection.execute("SELECT * FROM users WHERE `users_id`=?", [agents_id]);

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

exports.agentsRegister = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors });
    }

    const { name, business_name, branch_name, email, phone_number, password, confirm_password, role, country } = req.body
    const hash_pass = await bcrypt.hash(password, 12);
    const theToken = generateToken(email)
    try {
        if (theToken) {
            if (password === confirm_password) {
                const [row] = await connection.execute("SELECT * FROM users WHERE `email`=? AND `phone_number`=? ", [email, phone_number]);
                if (row.length === 0) {
                    const agents_id = generateUniqueId({ length: 10, useLetters: false });
                    const [rows] = await connection.execute(
                        "INSERT INTO users(`users_id`,`name`,`business_name`,`branch_name`,`email`,`phone_number`,`password`,`country`,`role`,`access_token`) VALUES(?,?,?,?,?,?,?,?,?,?)",
                        [agents_id, name, business_name, branch_name, email, phone_number, hash_pass, country, role, theToken]
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

exports.updateAgents = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors });
    }

    const { id } = req.params;
    const { name, business_name, branch_name, email, phone_number, country } = req.body

    const token = req?.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        }
        const [rows] = await connection.execute("UPDATE users SET  name=?, business_name=?, branch_name=?, email=?, phone_number=?,country=? WHERE id=?", [name, business_name, branch_name, email, phone_number, country, id])
        if (rows.affectedRows === 1) {
            const [row] = await connection.execute('select * from users WHERE id=?', [id])

            return res.json({ success: true, status: "success", message: 'Agents successfully Update !', data: row[0] })
        } else {
            return res.json({ success: false, message: 'Not update !' })
        }
    } catch (error) {
        return res.json({ success: false, error })
    }
}
