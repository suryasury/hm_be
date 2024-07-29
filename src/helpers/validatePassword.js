const bcrypt = require("bcryptjs");

const validatePassword = (password, passwordHash) => {
  try {
    return bcrypt.compareSync(password, passwordHash);
  } catch (err) {
    throw {
      message: "Error while validating password.",
    };
  }
};

module.exports = validatePassword;
