const jwt = require("jsonwebtoken");


function verifyToken(token) { return jwt.verify(token, "the-super-strong-secrect") };
module.exports = verifyToken;
