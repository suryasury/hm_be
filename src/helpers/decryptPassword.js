const cryptojs = require("crypto-js");

const decryptPassword = (encryptedPassword) => {
  try {
    let passwordBytes = cryptojs.AES.decrypt(
      encryptedPassword,
      process.env.PASSWORD_ENCRYPT_KEY,
    );
    return passwordBytes.toString(cryptojs.enc.Utf8);
  } catch (err) {
    throw {
      message: "Error while decrypting the password",
    };
  }
};
module.exports = decryptPassword;
