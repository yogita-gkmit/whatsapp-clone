const { sequelize } = require('../src/models');
const { connectToRedis } = require('../src/config/redis');

const environment = process.env.NODE_ENV || 'development';
const config = require('../src/config/config.js')[environment];

module.exports = async () => {
  if (environment === 'test') {
    await sequelize.sync({ force: true });
  }
  await connectToRedis();
};
