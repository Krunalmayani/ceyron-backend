require('dotenv').config();
const { validationResult } = require("express-validator");

const connection = require("../db").promise();
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");


exports.verifyEmail = async (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }
    const { email } = req.body;

    try {
        const [row] = await connection.execute("SELECT * FROM users WHERE email=?", [email]);

        if (row.length > 0) {
            const OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false, });

            const [cols] = await connection.execute("UPDATE users SET otp=?  WHERE email=?", [OTP, email]);

            if (cols.affectedRows === 1) {
                await sendEmail(email, OTP);
            } else {
                return res.json({ success: false, message: "Failed !" });

            }

            return res.json({ status: 200, success: true, message: "OTP Successfully Send Please Check Email Address", });
        } else {
            return res.json({ success: false, message: "Email Address Not Found !" })
        }
    } catch (error) {
        console.log("error :::", error);

        return res.json({ success: false, error });
    }
};

exports.checkOTP = async (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;
    try {
        const [row] = await connection.execute("SELECT * FROM users WHERE email=?", [email]);

        if (row.length > 0) {
            if (row[0].otp === otp) {
                return res.json({ success: true, status: "success", message: "Success! OTP Verified." })
            } else {
                return res.status(400).json({ success: false, message: 'OTP is invalid.' });
            }
        } else {
            return res.json({ success: false, message: "Email Address Not Found !" })
        }
    } catch (error) {
        console.log("error :::", error);

        return res.json({ success: false, error });
    }

}

async function sendEmail(email, otp) {
    var email = email;

    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', // SMTP server hostname
        port: 587, // TLS port for secure email communication
        secure: false, // Set to true for TLS, false for non-secure
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
    });

    var mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "ceyron.com",
        text: "That was easy!",
        html: ` <div class="container" style="max-width: 90%; margin: auto; padding-top: 20px">
              <h2>Welcome to the Ceyron.</h2>
              <p style="margin-bottom: 30px;">Pleas enter the  OTP to get started</p>
              <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${otp}</h1>
            </div>
          `,
    };

    transporter.verify(async function (error, success) {
        if (error) {
            console.log("::::----------------", error);
        } else {
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log("error :;", error);
                } else {
                    console.log("info :::", info);
                }
            });
        }
    });
}