const User = require('../models').User;
async function validUser(email) {
  const user = await User.findOne({ where: { email: email } });
  if (user) return true;
  else return false;
}

module.exports = { validUser };
