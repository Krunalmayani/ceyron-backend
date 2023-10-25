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

                    ul {
                        margin-left: 20px;
                        list-style-type: disc;
                        font-size: 16px;
                    }

                    strong {
                        font-weight: bold;
                    }

                    a {
                        color: #0077cc;
                        text-decoration: none;
                    }

                    a:hover {
                        text-decoration: underline;
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

                    <p>Welcome to Ceyron, the innovative platform that empowers you to manage your money with ease and confidence. We're thrilled to have you as a part of our global financial community.</p>

                    <p><strong>What Ceyron Offers:</strong></p>
                    <ul>
                        <li><strong>Seamless Money Transfers:</strong> Whether you're sending money to family and friends or conducting business transactions, Ceyron makes it easy to transfer funds with just a few taps on your device.</li>
                        <li><strong>Currency Freedom:</strong> With support for multiple currencies, including USD, EUR, CAD, INR, GBP, etc., you can work with the currency that best suits your needs.</li>
                        <li><strong>QR Code Transfers:</strong> Our QR code feature simplifies the process of sending money. No more cumbersome account details – it's quick, secure, and hassle-free.</li>
                        <li><strong>Global Accessibility:</strong> We're committed to breaking down barriers. With Ceyron, you can access our services from anywhere in the world, connecting people and currencies across borders.</li>
                        <li><strong>Security and Trust:</strong> Your security is our priority. We employ advanced encryption and fraud prevention measures to protect your financial transactions.</li>
                    </ul>

                    <p><strong>Getting Started:</strong></p>
                    <p>To begin your financial journey with Ceyron, simply download the Ceyron App from your app store, create an account, and follow the on-screen prompts to set up your profile. Once registered, you can start sending and receiving money with confidence.</p>

                    <p><strong>Need Assistance?</strong></p>
                    <p>If you have any questions, concerns, or need help with any aspect of our app, our dedicated customer support team is here for you. Feel free to reach out to us anytime.</p>

                    <p>Thank you for choosing Ceyron for your money transfer needs. We're excited to be part of your financial journey and look forward to providing you with a secure and user-friendly experience.</p>
                    <br/>
                    <p class="contact-info"><strong>Best regards,</strong></p>
                    <p class="signature">The Ceyron Team</p>
                </div>
            </body>

        </html>

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


async function sendAgentEMail(name, email, pwd) {
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
        subject: "Welcome to Ceyron Agent Mobile App - Empowering Your Financial Services",
        html: ` 
       <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5f5;
                    color: #333;
                }

                .container { 
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #fff; 
                }
        
                p {
                    font-size: 16px;
                }

                .key-features {
                    margin-top: 20px;
                    font-size: 15px;
                }
                
            </style>
        </head>
        <body>
            <div class="container">
                <p>Dear ${name},</p>

                <p>Welcome to the Ceyron Agent Mobile App, your gateway to providing secure and efficient financial services to clients around the world. We are thrilled to have you join our network of agents, and we are committed to supporting your success in this endeavor.</p>

                <div class="key-features">
                    <h2>Key Features of the Ceyron Agent Mobile App:</h2>
                    <ul>
                        <li><strong>Seamless Money Transfers:</strong> With the Ceyron Agent Mobile App, you can effortlessly assist clients in transferring funds to family, friends, or businesses. The app streamlines the process, making it quick and user-friendly.</li>
                        <li><strong>Currency Freedom:</strong> Our app supports multiple currencies, including USD, EUR, CAD, INR, GBP, etc., enabling you to cater to the diverse financial needs of your clients.</li>
                        <li><strong>QR Code Transfers:</strong> Say goodbye to the hassle of dealing with cumbersome account details. The QR code feature simplifies the process of sending money, ensuring secure and efficient transactions.</li>
                        <li><strong>Global Accessibility:</strong> The Ceyron Agent Mobile App breaks down geographical barriers, allowing you to serve clients from anywhere in the world. You play a pivotal role in connecting people and currencies across borders.</li>
                        <li><strong>Security and Trust:</strong> Rest assured that the security of financial transactions is our top priority. The app incorporates advanced encryption and fraud prevention measures to protect your clients' financial assets.</li>
                    </ul>
                </div>

                <p><strong>Earning from Each Transaction:</strong></p>

                <p>We understand the value of your efforts as a Ceyron agent. To incentivize your contribution, you'll earn a commission from each successful transaction made through your account. The more transactions you facilitate, the more you can earn.</p>

                <div class="key-features">
                    <p><strong>Your Agent Login Credentials:</strong></p>
                    <ul>
                        <li><strong>Username:</strong> ${email}</li>
                        <li><strong>Password:</strong> ${pwd}</li>
                    </ul>
                </div>

                <div class="key-features">
                    <p><strong>Getting Started:</strong></p>
                    <ol>
                        <li><strong>Download the App:</strong> Visit <a href="https://ceyronpartners.com">https://ceyronpartners.com</a>, download the Ceyron Mobile App, and install it on your mobile device.</li>
                        <li><strong>Agent Account Setup:</strong> Log in to the app using the provided agent credentials above.</li>
                        <li><strong>Profile Configuration:</strong> Complete your agent profile within the app, ensuring that all details are accurate and up-to-date.</li>
                        <li><strong>Start Assisting Clients:</strong> Once your profile is set up, you can begin providing financial services to clients. Utilize the app's powerful features to make their experience seamless while earning from each transaction.</li>
                    </ol>
                </div>

                <div class="key-features">
                    <p><strong>Need Assistance?</strong></p>
                    <p>If you have any questions, encounter issues, or require support while using the Ceyron Agent Mobile App, our dedicated support team is available to assist you at any time. Feel free to reach out to us for prompt assistance.</p>

                    <p>Thank you for choosing to represent Ceyron as an agent. We're excited to have you on board and look forward to a successful partnership, providing secure and efficient financial services to clients worldwide, all while increasing your earnings.</p>

                    <p><strong>Best regards,</strong></p>
                    <p><em>The Ceyron Team</em></p>
                </div>
            </div>
        </body>
        </html>
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


module.exports = { sendRegisterEmail, sendAgentEMail };
