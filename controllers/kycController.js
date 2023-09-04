require('dotenv').config();
const { validationResult } = require("express-validator");
const connection = require("../db").promise();

exports.kycVerifyData = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { agents_id, full_name, email, dob, address, state, country, zip_code } = req.body;

    if (!req.files) {
        return res.json({ success: false, message: 'Image is Not upload!' })
    }

    const url = req.protocol + '://' + process.env.IP_PORT + '/uploads/'

    const selfie_with_document = url + 'selfies_with_documents/' + req.files.Selfie_with_document[0].filename;
    const front_document = url + 'kyc_front_images/' + req.files.KYC_Front_Image[0].filename;
    const back_document = url + 'kyc_back_images/' + req.files.KYC_Back_Image[0].filename;

    const token = req?.headers?.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.json({ success: false, status: 'error', message: "auth Token not found" });
        }

        const [col] = await connection.execute("UPDATE users SET kyc_status=?  WHERE users_id=?", ['pending', agents_id]);
        if (col.affectedRows !== 1) {
            return res.json({ success: false, message: 'KYC Not Inserted !', })
        }

        const [rows] = await connection.execute(
            "INSERT INTO  kycdetails (`agents_id`,`name`,`email`,`dob`,`address`,`state`,`country`,`zipcode`,`selfie_with_document`,`front_document`,`back_document`) VALUES(?,?,?,?,?,?,?,?,?,?,?)",
            [agents_id, full_name, email, new Date(dob), address, state, country, zip_code, selfie_with_document, front_document, back_document]
        );

        if (rows.affectedRows === 1 && col.affectedRows === 1) {
            const [row] = await connection.execute('select * from kycdetails WHERE id=?', [rows?.insertId])
            return res.json({ success: true, status: 'success', message: 'kycdetails successfully Inserted !', data: row[0] })
        } else {
            return res.json({ success: false, message: 'kycdetails not updated !' })
        }

    } catch (error) {
        return res.json({ success: false, message: error });
    }
}

exports.getKycData = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const token = req?.headers?.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.json({ success: false, status: 'error', message: "auth Token not found" });
        }

        const [rows] = await connection.execute('select * from kycdetails');

        if (rows.length > 0) {
            return res.json({ success: true, status: 'success', data: rows })
        } else {
            return res.json({ success: false, message: 'Data Not Found !' })
        }

    } catch (error) {
        return res.json({ success: false, message: error });
    }
}
exports.getAgentKycData = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const token = req?.headers?.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.json({ success: false, status: 'error', message: "auth Token not found" });
        }

        const [rows] = await connection.execute('SELECT  kyc.* FROM  kycdetails AS  kyc INNER JOIN users AS u ON u.users_id =kyc.agents_id WHERE u.role = "Agent"');

        if (rows.length > 0) {
            return res.json({ success: true, status: 'success', data: rows })
        } else {
            return res.json({ success: true, status: 'success', data: [], message: 'Data Not Found !' })
        }

    } catch (error) {
        return res.json({ success: false, message: error });
    }
}

exports.getUserKycData = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const token = req?.headers?.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.json({ success: false, status: 'error', message: "auth Token not found" });
        }

        const [rows] = await connection.execute('SELECT  kyc.* FROM  kycdetails AS  kyc INNER JOIN users AS u ON u.users_id =kyc.agents_id WHERE u.role = "User"');

        if (rows.length > 0) {
            return res.json({ success: true, status: 'success', data: rows })
        } else {
            return res.json({ success: true, status: 'success', data: [], message: 'Data Not Found !' })
        }

    } catch (error) {
        return res.json({ success: false, message: error });
    }
}

exports.getKycDataBYID = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const token = req?.headers?.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.json({ success: false, status: 'error', message: "auth Token not found" });
        }

        const [rows] = await connection.execute('select * from kycdetails where id=?', [id]);

        if (rows.length > 0) {
            return res.json({ success: true, status: 'success', data: rows[0] })
        } else {
            return res.json({ success: false, message: 'Data Not Found !' })
        }

    } catch (error) {

        return res.json({ success: false, message: error });
    }
}

exports.changeKycStatus = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { email, status, agents_id } = req.body;
    const { id, } = req.params;

    const token = req?.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.json({ success: false, status: 'error', message: "auth Token not found" });
        }

        const [rows] = await connection.execute("UPDATE kycdetails SET status = ?, email = ? WHERE id = ? AND agents_id = ?", [status, email, id, agents_id]);

        if (rows.affectedRows === 1) {
            const [row] = await connection.execute('select * from kycdetails WHERE id=? AND agents_id = ?', [Number(id), agents_id])

            return res.json({ success: true, status: 'success', message: 'Status successfully Updated !', data: row[0] })
        } else {
            return res.json({ success: false, message: 'Contest Category Not Updated !' })
        }

    } catch (error) {
        return res.json({ success: false, message: error });
    }
}

exports.deleteKYC = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const token = req?.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        }
        const [row] = await connection.execute("select * FROM kycdetails WHERE id=?", [id])
        const [col] = await connection.execute("UPDATE users SET kyc_status=?  WHERE users_id=?", [null, row[0].agents_id]);

        const [rows] = await connection.execute("DELETE FROM kycdetails WHERE id=?", [id])

        if (rows.affectedRows === 1) {

            return res.json({ success: true, status: "success", message: 'KYC successfully Delete !', data: id })
        } else {
            return res.json({ success: false, message: 'KYC Not Delete or User Not Found !' })
        }
    } catch (error) {
        return res.json({ success: false, error })
    }
}