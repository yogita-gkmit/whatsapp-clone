const { sequelize } = require('../src/models');
const { reddis } = require('../src/config/redis');

module.exports = async () => {
  // Close Sequelize database connection
  console.log('Closing DB connection...');
  await sequelize.close();

  // Quit Redis client connection
  console.log('Closing Redis client...');
  await reddis.quit();
};
