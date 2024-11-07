const { createClient } = require('redis');

const redisClient = createClient();

async function connectToRedis() {
  try {
    redisClient.on('error', err => {
      console.log('Error connecting redis client', err);
    });

    await redisClient.connect();
    console.log('Redis connected successfully');
  } catch (err) {
    console.log('Error connecting redis', err);
  }
}
module.exports = { redisClient, connectToRedis };
