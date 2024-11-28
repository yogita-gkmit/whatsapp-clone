const User = require('../models').User;
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');

async function validUser(email) {
  const user = await User.findOne({ where: { email: email } });
  if (user) return true;
  else return false;
}

async function generateOtp() {
  let otp = otpGenerator.generate(6, {
    upperCaseAlphabets: false,
    lowerCaseAlphabets: false,
    specialChars: false,
  });
  return otp;
}

async function verifyToken(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        reject(new Error('Invalid or expired token'));
      } else {
        resolve(decoded);
      }
    });
  });
}
module.exports = { validUser, verifyToken, generateOtp };
