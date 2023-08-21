const { validationResult } = require("express-validator");
const connection = require("../db").promise();

exports.globalSettings = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const token = req?.headers?.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        }

        const [row] = await connection.execute('select * from global_settings')

        if (row.length > 0) {
            return res.json({ data: row[0], success: true, status: "success", })
        } else {
            return res.json({ success: false, message: "Unauthorized accress !" });
        }

    } catch (error) {
        return res.json({ success: false, error })
    }
}


exports.verifyPin = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const token = req?.headers?.authorization?.split(" ")[1];
    const { id, pin, confirm_pin } = req.body;

    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        }
        if (pin !== confirm_pin) {
            return res.json({ success: false, message: "Both Pin Are Not Same!!" });

        }

        const [row] = await connection.execute('select * from users where id=?', [id])

        if (row[0].security_pin === pin) {
            return res.json({ success: true, status: "success", data: row[0] })
        } else {
            return res.json({ success: false, message: "Invalid Pin!" });
        }

    } catch (error) {
        return res.json({ success: false, error })
    }
}