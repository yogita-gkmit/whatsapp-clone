const request = require('supertest');
const app = require('../src/index'); // Path to your express app

describe('Authentication API', () => {
  let token;
  let userEmail = 'test@example.com';

  beforeAll(async () => {
    await require('./setup')();
  });

  afterAll(async () => {
    await require('./teardown')();
  });

  describe('POST /sendOtp', () => {
    it('should send OTP to a registered user', async () => {
      // Assuming a user is already registered with this email
      const res = await request(app)
        .post('/sendOtp')
        .send({ email: userEmail });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.message).toHaveProperty('otp');
    });

    it('should return error for unregistered user', async () => {
      const res = await request(app)
        .post('/sendOtp')
        .send({ email: 'unregistered@example.com' });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty('message', 'User is not registered');
    });
  });

  describe('POST /verifyOtp', () => {
    let otp;

    beforeAll(async () => {
      // Send OTP to get it for verification
      const res = await request(app)
        .post('/sendOtp')
        .send({ email: userEmail });

      otp = res.body.message.otp;
    });

    it('should verify OTP and return a token', async () => {
      const res = await request(app)
        .post('/verifyOtp')
        .send({ email: userEmail, otp });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      token = res.body.token; // Save token for logout test
    });

    it('should return error for invalid OTP', async () => {
      const res = await request(app)
        .post('/verifyOtp')
        .send({ email: userEmail, otp: '123456' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'OTP did not matched');
    });
  });

  describe('POST /register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/register')
        .field('name', 'Test User')
        .field('email', 'newuser@example.com')
        .field('about', 'About new user')
        .attach('image', 'path/to/image.jpg'); // Provide path to a test image

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty(
        'message',
        'User has been successfully created',
      );
    });

    it('should return error for already registered user', async () => {
      const res = await request(app)
        .post('/register')
        .field('name', 'Test User')
        .field('email', userEmail)
        .field('about', 'About existing user')
        .attach('image', 'path/to/image.jpg');

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message', 'User already registered');
    });
  });

  describe('POST /logout', () => {
    it('should log out the user', async () => {
      const res = await request(app)
        .post('/logout')
        .set('Authorization', token);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Logged out successfully');
    });

    it('should return error if token is not provided', async () => {
      const res = await request(app).post('/logout');

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty(
        'message',
        'Token is required for logout',
      );
    });
  });
});
