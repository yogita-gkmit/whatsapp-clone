const { sequelize } = require('../src/models');
const redisClient = require('../src/config/redis').reddis;

module.exports = async () => {
  await sequelize.close();
  await redisClient.quit();
};
