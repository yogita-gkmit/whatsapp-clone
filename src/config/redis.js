const Redis = require('ioredis');
const dotenv = require('dotenv');
dotenv.config();

const reddis = new Redis({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

async function connectToRedis() {
  reddis.on('connect', () => {
    console.log('Connected to Redis successfully');
  });
  reddis.on('error', err => {
    console.error('Redis connection error:', err);
  });
}

module.exports = { connectToRedis, reddis };
