const redis = require('redis');
const dotenv = require('dotenv');
dotenv.config();

const reddis = redis.createClient({
  url: process.env.REDIS_URI,
});

async function connectToRedis() {
  reddis.connect().catch(console.error);
  reddis.on('connect', () => {
    /* istanbul ignore next */
    console.log('Connected to Redis successfully');
    /* istanbul ignore next */
  });
  reddis.on('error', err => {
    /* istanbul ignore next */
    console.error('Redis connection error:', err);
    /* istanbul ignore next */
  });
}

module.exports = { connectToRedis, reddis };
