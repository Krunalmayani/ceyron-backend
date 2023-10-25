require('dotenv').config();
const { validationResult } = require("express-validator");
const clm = require('country-locale-map');

const connection = require("../db").promise();
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");
const axios = require("axios")


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
                await sendEmail(email, row[0]?.name || 'Customer', OTP);
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

async function sendEmail(email, name, otp) {
    var email = email;

    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST, // SMTP server hostname
        port: 587, // TLS port for secure email communication
        secure: false, // Set to true for TLS, false for non-secure
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        },
    });

    var mailOptions = {
        from: process.env.EMAIL_ADDRESS,
        to: email,
        subject: "Your Ceyron App Password Reset",
        html: ` 
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f5f5f5;
                    margin: 0;
                    padding: 0;
                }

                .container {
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #fff;
                }

                p {
                    font-size: 16px;
                    line-height: 1.6;
                    margin-bottom: 15px;
                }

                ol {
                    margin-left: 20px;
                    font-size: 14px;
                }

                strong {
                    font-weight: bold;
                }

                .important-note {
                    padding: 10px;
                    margin-top: 20px;
                }

                .contact-info {
                    font-size: 14px;
                }

                .signature {
                    font-style: italic;
                }
            </style>
        </head>
        <body>
            <div class="container">

                <p>Dear ${name},</p>

                <p>You recently requested a password reset for your Ceyron App account. We've generated a 6-digit PIN for you to complete this process.</p>

                <p>Your 6-digit PIN is: <strong>${otp}</strong></p>

                <p><strong>To reset your password, please follow these steps:</strong></p>
                <ol>
                    <li>Open the Ceyron App on your device.</li>
                    <li>When prompted, enter your registered email ID: ${email}.</li>
                    <li>Enter the 6-digit PIN you received in this email.</li>
                    <li>Follow the on-screen instructions to set a new password for your account.</li>
                </ol>

                <div class="important-note">
                    <p><strong>Important Security Note:</strong></p>
                    <p>Do not share your PIN with anyone.</p>
                    <p>If you did not request this password reset, please contact our support team immediately.</p>
                </div>

                <p>Thank you for choosing Ceyron for your money transfer needs. If you have any questions or need assistance, please don't hesitate to reach out to our customer support team.</p>
                <br />
                <p class="contact-info"><strong>Best regards,</strong></p>
                <p class="signature">The Ceyron Team</p>
            </div>
        </body>
        </html>`,
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


exports.changeCurrency = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { country } = req.query;

    const token = req?.headers?.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.json({ success: false, status: 'error', message: "auth Token not found" });
        }
        if (!country) {
            return res.json({ success: false, status: 'error', message: "Please Add Country Name!" });
        }

        const symbol = clm.getCurrencyByName(country);

        if (symbol !== undefined) {
            const config = {
                method: 'get',
                url: process.env.API_URL + symbol,
                headers: { 'apikey': process.env.API_KEY }
            }
            let response = await axios(config);

            if (response?.data?.success === true) {
                const rates = response.data.rates[symbol];
                const data = {
                    country,
                    base: response?.data?.base,
                    symbol, rates,
                    date: response?.data?.date,
                }
                return res.json({ success: true, status: 'success', data, })

            } else {
                return res.json({ success: false, message: "Currency Rates Not Found !", })
            }
        } else {
            return res.json({ success: false, message: "Country Invalid !", })
        }
    } catch (error) {
        return res.json({ success: false, message: error });
    }
}


exports.changeCountry = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const { id, country } = req.body;

    const token = req?.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        }
        const [rows] = await connection.execute("UPDATE users SET  currency_country=?  WHERE id=?", [country, id])
        if (rows.affectedRows === 1) {
            const [row] = await connection.execute('select * from users WHERE id=?', [id])

            return res.json({ success: true, status: "success", message: 'Agents successfully Update !', data: row[0] })
        } else {
            return res.json({ success: false, message: 'Not update !' })
        }

    } catch (error) {
        console.log('error :', error);
        return res.json({ success: false, error });
    }
}

exports.getAllCountries = async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    const token = req?.headers?.authorization?.split(" ")[1];
    try {
        if (!token) {
            return res.json({ success: false, message: "auth Token not found" });
        } else {
            const countryList = clm.getAllCountries();
            if (countryList.length > 0) {
                return res.json({ data: countryList, success: true, status: 'success', })
            } else {
                return res.json({ success: false, message: "Data Not Found !" });
            }
        }
    } catch (error) {
        return res.json({ success: false, error })
    }
}