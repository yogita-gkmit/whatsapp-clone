const { sequelize } = require('../src/models');
const { connectToRedis } = require('../src/config/redis');

module.exports = async () => {
  await sequelize.sync();
  await connectToRedis();
};
