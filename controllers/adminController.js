const { validationResult } = require("express-validator");
const connection = require("../db").promise();
const bcrypt = require("bcryptjs");
const generateToken = require("../untils/generateToken");



exports.register = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { first_name, last_name, user_name, email, phone_number, password } = req.body;

    try {
        const [row] = await connection.execute("SELECT * FROM admin WHERE `email`=?", [email]);
        if (row.length > 0) {
            return res.json({ success: false, message: "The E-mail already in use", });
        } else {
            const hash_pass = await bcrypt.hash(password, 12);
            const theToken = generateToken(email)

            const [rows] = await connection.execute(
                "INSERT INTO admin(`first_name`,`last_name`,`user_name`,`email`,`phone_number`,`password`,access_token) VALUES(?,?,?,?,?,?,?)",
                [first_name, last_name, user_name, email, phone_number, hash_pass, theToken]
            );
            if (rows.affectedRows === 1) {
                const [col] = await connection.execute("SELECT * FROM admin WHERE email=?", [email]);
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
        const [row] = await connection.execute("SELECT * FROM admin WHERE `email`=?", [email]);

        if (row.length === 0) {
            return res.json({ success: false, message: "Invalid email address", });
        } else {
            const passMatch = await bcrypt.compare(password, row[0].password);
            if (!passMatch) {
                return res.json({ success: false, message: "Incorrect password", });
            } else {
                const theToken = generateToken(email);
                if (theToken) {

                    const [rows] = await connection.execute("UPDATE admin SET access_token =?  WHERE email=?", [theToken, email]);

                    const [cols] = await connection.execute("SELECT * FROM admin WHERE `email`=?", [email]);

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
        const [row] = await connection.execute("SELECT * FROM admin WHERE email=?", [email]);

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
        return res.json({ success: false, error })
    }
}


exports.checkOTP = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { otp } = req.body;
    try {
        const [row] = await connection.execute("SELECT * FROM admin WHERE `otp`=? ", [otp]);

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

            const [row] = await connection.execute("SELECT * FROM admin WHERE email=?", [email]);

            if (row.length > 0) {
                const [rows] = await connection.execute("UPDATE admin SET password=?  WHERE email=?", [hash_pass, email]);

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

            const [row] = await connection.execute("SELECT * FROM admin WHERE email=?", [email]);

            if (row.length > 0) {

                const hash_old_pass = await bcrypt.compare(old_password, row[0]?.password);
                const hash_new_pass = await bcrypt.hash(new_password, 12);

                if (!hash_old_pass) {
                    return res.json({ success: false, message: "Incorrect old password" });
                } else {
                    const [val] = await connection.execute("UPDATE admin SET password=?  WHERE email=?", [hash_new_pass, email]);
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
    const { id, transaction_limits, funding_limits, transaction_fees, fx_rates } = req.body;
    const token = req?.headers?.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        }

        const [rows] = await connection.execute("UPDATE global_settings SET transaction_limits=?, funding_limits=?,fx_rates=?,transaction_fees=? WHERE id=?", [transaction_limits, funding_limits, fx_rates, transaction_fees, Number(id)])

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