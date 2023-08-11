const { validationResult } = require("express-validator");
const connection = require("../db").promise();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require('moment');
const verifyToken = require("../untils/verifyToken");

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

exports.updateUsers = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors });
    }
    const { user_id, name, email, phone_no, created_at } = req.body
    const token = req?.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        }

        const [row] = await connection.execute("SELECT * FROM users WHERE `email`=? AND `phone_no`=? ", [email, phone_no]);
        if (row.length === 0) {
            const [rows] = await connection.execute("UPDATE users SET name=?,email=?,phone_no=?,created_at=? WHERE user_id=?", [name, email, phone_no, moment(created_at).format('YYYY-MM-DD hh:mm:ss'), Number(user_id)])

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