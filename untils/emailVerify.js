require('dotenv').config();
const nodemailer = require("nodemailer");


async function sendRegisterEmail(email, name) {
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
        subject: "Welcome to Ceyron - Your Gateway to Secure Money Transfers",
        html: ` 
        <div>
        <p style="font-weight: 900;color: #000">Dear ${name}, </p>
        <p style="color: #000;">Welcome to Ceyron, the innovative platform that empowers you to manage your money with ease and confidence. We're thrilled to have you as a part of our global financial community. </p>

        <p  style="font-weight: 900;color: #000;">What Ceyron Offers:</p>

        <ul  style="color: #000;">
            <li style="color: #000;font-weight: 900;">Seamless Money Transfers:
                <span style="font-weight: 300;color: #000;"> Whether you're sending money to family and friends or conducting business transactions, Ceyron makes it easy to transfer funds with just a few taps on your device.</span>
            </li>
            <li style="color: #000;font-weight: 900;"> Currency Freedom: 
                <span style="font-weight: 300;color: #000;"> With support for multiple currencies, including USD, EUR, CAD, INR, GBP, etc., you can work with the currency that best suits your needs.</span>
            </li>

            <li style="color: #000;font-weight: 900;"> QR Code Transfers:
                <span style="font-weight: 300;color: #000;">Our QR code feature simplifies the process of sending money. No more cumbersome account details – it's quick, secure, and hassle-free.</span>
            </li>

            <li style="color: #000;font-weight: 900;"> Global Accessibility: 
                <span style="font-weight: 300;color: #000;">We're committed to breaking down barriers. With Ceyron, you can access our services from anywhere in the world, connecting people and currencies across borders.</span>
            </li>

            <li style="color: #000;font-weight: 900;"> Security and Trust: 
                <span style="font-weight: 300;color: #000;">Your security is our priority. We employ advanced encryption and fraud prevention measures to protect your financial transactions.</span>
            </li>

        </ul>

        
        <p  style="font-weight: 900;color: #000;">Getting Started: </p>
        <p style="color: #000;"> To begin your financial journey with Ceyron, simply download the Ceyron App from your app store, create an account, and follow the on-screen prompts to set up your profile. Once registered, you can start sending and receiving money with confidence. </p>

        <p  style="font-weight: 900;color: #000;">Need Assistance? </p>
        <p style="color: #000;"> If you have any questions, concerns, or need help with any aspect of our app, our dedicated customer support team is here for you. Feel free to reach out to us anytime. </p>
 
        <p style="color: #000;">  Thank you for choosing Ceyron for your money transfer needs. We're excited to be part of your financial journey and look forward to providing you with a secure and user-friendly experience.</p>

        <br />
        <p style="color: #000;"> Best regards,</p>
        <p style="color: #000;"> The Ceyron Team </p>
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

module.exports = sendRegisterEmail;
