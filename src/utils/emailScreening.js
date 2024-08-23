const hideEmail = function (email) {
  return email.replace(/(.{2})(.*)(?=@)/, function (_, firstTwo, middle) {
    let hiddenPart = "";
    for (let i = 0; i < middle.length - 1; i++) {
      hiddenPart += "*";
    }
    return firstTwo + hiddenPart + middle.slice(-1);
  });
};

module.exports = hideEmail;
