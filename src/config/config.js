require('dotenv').config({ path: '../.env' });

console.log(
  process.env.USERNAME,
  process.env.PASSWORD,
  process.env.DATABASE,
  process.env.HOST,
);
module.exports = {
  development: {
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    host: process.env.HOST,
    dialect: 'postgres',
  },
  test: {
    username: process.env.USERNAME,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    host: process.env.HOST,
    dialect: 'postgres',
  },
};
