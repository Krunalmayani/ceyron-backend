const { validationResult } = require("express-validator");
const connection = require("../db").promise();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


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


