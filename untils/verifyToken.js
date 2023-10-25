const jwt = require("jsonwebtoken");


const verifyToken = (req, res, next) => {
    const token = req?.headers?.authorization?.split(" ")[1];
    if (!token) {
        return res.json({ success: false, message: "auth Token not found" });
    }

    jwt.verify(token, 'the-super-strong-secrect', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token is invalid' });
        }
        req.decoded = decoded;
        next();
    });
};
module.exports = verifyToken;
