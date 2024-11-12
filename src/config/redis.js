// const redis = require('redis');
const Redis = require('ioredis');
const dotenv = require('dotenv');
dotenv.config();

const reddis = new Redis({
  host: 'localhost',
  port: 6379,
});

async function connectToRedis() {
  reddis.on('connect', () => {
    console.log('Connected to Redis successfully');
  });
  reddis.on('error', err => {
    console.error('Redis connection error:', err);
  });
}

const testRedisConnection = async () => {
  try {
    // Set a value in Redis
    await reddis.set('myKey', 'Hello, Redis!');
    // Get the value from Redis
    const value = await reddis.get('myKey');
    console.log('Retrieved from Redis:', value); // Should output: Hello, Redis!
  } catch (err) {
    console.error('Error interacting with Redis:', err);
  } finally {
    // Always close the connection when you're done
    reddis.quit();
  }
};

module.exports = { connectToRedis, testRedisConnection };
