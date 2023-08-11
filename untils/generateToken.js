const jwt = require("jsonwebtoken");

function generateToken(email) {
  let token = jwt.sign(
    {
      // exp: Math.floor(Date.now() / 1000) + 120 * 120,
      data: email,
      algorithm: "RS256",
    },
    "the-super-strong-secrect"
  );
  return token;
};
module.exports = generateToken;
