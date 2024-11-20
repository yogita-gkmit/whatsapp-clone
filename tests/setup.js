const { sequelize } = require('../src/models');
const { connectToRedis } = require('../src/config/redis');
const { execSync } = require('child_process');

module.exports = async ({ resetDatabase = false } = {}) => {
  try {
    console.log('Checking DB connection...');
    await sequelize.authenticate(); // Ensure the database is connected
    console.log('Connection successful');

    if (resetDatabase) {
      // Reset the database schema using sequelize.sync({ force: true })
      console.log('Resetting the database schema...');
      await sequelize.sync({ force: true }); // Drop and recreate all tables based on current models
      console.log('Database schema reset successfully!');
    }

    await connectToRedis(); // Ensure Redis is connected
  } catch (error) {
    console.error('Error during setup: ', error.message);
    console.error(error.stack);
    throw error;
  }
};
