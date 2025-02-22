const bcrypt = require("bcryptjs");

const hashPassword = (password) => {
  try {
    return bcrypt.hashSync(
      password,
      parseInt(process.env.PASSWORD_SALT_ROUNDS),
    );
  } catch (err) {
    console.log("error hashing password", err);
    throw {
      message: err,
    };
  }
};

module.exports = hashPassword;
