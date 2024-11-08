const User = require('../models/User.js');

async function validUser(userEmail) {
  try {
    var user = await User.find({
      where: { email: userEmail },
    });
    if (user) return true;

    return false;
  } catch (err) {
    return err.message;
  }
}

module.exports = { validUser };

// var findUserDevice = function (userDeviceId) {
//   var device = db.DeviceUser.find({
//     where: {
//       id: userDeviceId,
//     },
//   }).then(function (device) {
//     if (!device) {
//       return 'not find';
//     }
//     return device.dataValues;
//   });
// };
