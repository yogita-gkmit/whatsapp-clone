const Redis = require('ioredis');
const dotenv = require('dotenv');
dotenv.config();

const reddis = new Redis({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

async function connectToRedis() {
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
