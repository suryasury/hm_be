const jwt = require("jsonwebtoken");

const generateAccesToken = (payload, expiresIn = "12h") => {
  try {
    return jwt.sign({ data: JSON.stringify(payload) }, process.env.JWT_SECRET, {
      expiresIn,
    });
  } catch (err) {
    throw err;
  }
};

module.exports = generateAccesToken;
