const request = require('supertest');
const app = require('../../src/index');
const { User, sequelize } = require('../../src/models');
const { transporter } = require('../../src/utils/email.util');
const environment = process.env.NODE_ENV || 'development';
const config = require('../../src/config/config.js')[environment];
var randomstring = require('randomstring');
let server;
const redis = require('redis'); // Assuming you're using 'redis' package in your app
const redisMock = require('redis-mock'); // This is a mock of Redis

// Use the mock Redis client instead of the real one
jest.mock('redis', () => redisMock);
jest.mock('../../src/utils/email.util');

beforeAll(done => {
	server = app.listen(5000, () => {
		done();
	});
});

describe('Authentication API', () => {
	let userEmail = `${randomstring.generate(10)}@gmail.com`;
	let testOtp;
	let userToken;
	let user;
	beforeAll(async () => {
		await require('../setup')();
		// await sequelize.sync({ force: true });

		user = await User.create({
			name: 'Test User',
			email: userEmail,
			about: 'Test user for authentication API tests',
			image: `${randomstring.generate(10)}`,
		});
	});

	afterAll(async () => {
		await require('../tearDown')();
		await new Promise(resolve => server.close(resolve));
	});

	describe('POST /sendOtp', () => {
		it('should send OTP to a registered user', async () => {
			transporter.sendMail.mockImplementation((mailOptions, callback) => {
				callback(null, { response: '250 OK' });
			});

			const res = await request(app)
				.post('/api/auth/sendOtp')
				.send({ email: userEmail });

			console.log('Response Body:', res.body);

			expect(res.statusCode).toEqual(200);

			expect(res.body).toHaveProperty('success', true);

			testOtp = res.body.message.otp;

			console.log(`testOtp:`, testOtp);
		});

		it('should return error for unregistered user', async () => {
			const res = await request(app)
				.post('/api/auth/sendOtp')
				.send({ email: 'unregistered@example.com' });

			expect(res.statusCode).toEqual(404);
			expect(res.body).toHaveProperty('message', 'User is not registered');
		});
	});

	describe('POST /verifyOtp', () => {
		it('should verify OTP for a registered user', async () => {
			// Mock setting OTP in redis
			redis.set = jest.fn().mockResolvedValue(true);
			await redis.set(userEmail, testOtp, 'EX', 300); // 5 minutes expiry

			// Send the request to verify OTP
			const res = await request(app)
				.post('/api/auth/verifyOtp')
				.send({ email: userEmail, otp: testOtp });

			// Check if status is 200 and response contains the token
			expect(res.statusCode).toEqual(200);
			expect(res.body).toHaveProperty('token'); // Expect token in the response

			// Optionally save the token for later use
			userToken = res.body.token;
		});

		it('should return error for invalid OTP', async () => {
			const res = await request(app)
				.post('/api/auth/verifyOtp')
				.send({ email: userEmail, otp: '987654' });

			expect(res.statusCode).toEqual(401);
			expect(res.body).toHaveProperty('message', 'OTP did not match');
		});

		it('should return error for unregistered user', async () => {
			const res = await request(app)
				.post('/api/auth/verifyOtp')
				.send({ email: 'unregistered@example.com', otp: testOtp });

			expect(res.statusCode).toEqual(400);
		});
	});

	describe('POST /register', () => {
		it('should register a new user', async () => {
			const res = await request(app)
				.post('/api/auth/register')
				.field('name', 'New User')
				.field('email', `${randomstring.generate(10)}@gmail.com`)
				.field('about', 'This is a new user')
				.attach('image', Buffer.from('dummy image content'), 'image.jpg');

			expect(res.statusCode).toEqual(200);
			expect(res.body).toHaveProperty(
				'message',
				'User has been successfully created',
			);
		});

		it('should return error for already registered user', async () => {
			const res = await request(app)
				.post('/api/auth/register')
				.field('name', 'Test User')
				.field('email', userEmail)
				.field('about', 'This user is already registered')
				.attach('image', Buffer.from('dummy image content'), 'image.jpg');

			expect(res.statusCode).toEqual(409);
			expect(res.body).toHaveProperty('message', 'User already registered');
		});
	});

	describe('POST /logout', () => {
		it('should log out a user', async () => {
			console.log(
				'##################################################',
				userToken,
			);
			const res = await request(app)
				.post('/api/auth/logout')
				.set('authorization', userToken);

			console.log('>>> Response status for logout:', res.statusCode);
			console.log('>>> Response body for logout:', res.body);

			expect(res.statusCode).toEqual(200);
			expect(res.body).toHaveProperty('message', 'Logged out successfully');
		});

		it('should return error for missing token', async () => {
			const res = await request(app).post('/api/auth/logout');

			expect(res.statusCode).toEqual(401);
			expect(res.body).toHaveProperty('message', 'Unauthorized');
		});

		it('should return error for invalid token', async () => {
			const res = await request(app)
				.post('/api/auth/logout')
				.set('authorization', 'invalidtoken');

			expect(res.statusCode).toEqual(401);
			expect(res.body).toHaveProperty('message', 'Unauthorized');
		});
	});
});
