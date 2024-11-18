const request = require('supertest');
const app = require('../../src/index');
const User = require('../../src/models').User;
const { transporter } = require('../../src/utils/email.util');
const environment = process.env.NODE_ENV || 'development';
const config = require('../../src/config/config.js')[environment];


let server;

jest.mock('../../src/utils/email.util');


beforeAll(done => {
	server = app.listen(4000, () => {
		done();
	});
});

describe('Authentication API', () => {
	let userEmail = 'test@gmail.com';
	let testOtp;
	let userToken;
	let user;

	beforeAll(async () => {
		await require('../setup')();

		user = await User.create({
			name: 'Test User',
			email: userEmail,
			about: 'Test user for authentication API tests',
			image: 'test-image-url',
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
			expect(res.body).toHaveProperty('message');
			expect(res.body.message).toHaveProperty('otp');
			expect(res.body.message.otp).toBeDefined();

			expect(transporter.sendMail).toHaveBeenCalled();

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
			// jwt.sign.mockReturnValue(userToken);

			const res = await request(app)
				.post('/api/auth/verifyOtp')
				.send({ email: userEmail, otp: testOtp });

			console.log(`res.body`, res.body);

			expect(res.statusCode).toEqual(200);
			expect(res.body).toHaveProperty('message', 'User verified successfully');

			userToken = res.body.token;

			console.log(`>> userToken`, userToken);
		});

		it('should return error for invalid OTP', async () => {
			const res = await request(app)
				.post('/api/auth/verifyOtp')
				.send({ email: userEmail, otp: '987654' });

			expect(res.statusCode).toEqual(400);
			expect(res.body).toHaveProperty('message', 'OTP did not match');
		});

		it('should return error for unregistered user', async () => {
			const res = await request(app)
				.post('/api/auth/verifyOtp')
				.send({ email: 'unregistered@example.com', otp: testOtp });

			expect(res.statusCode).toEqual(404);
			expect(res.body).toHaveProperty('message', 'User is not registered');
		});
	});

	describe('POST /register', () => {
		it('should register a new user', async () => {
			const res = await request(app)
				.post('/api/auth/register')
				.field('name', 'New User')
				.field('email', 'newuser@example.com')
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

			expect(res.statusCode).toEqual(400);
			expect(res.body).toHaveProperty('message', 'User already registered');
		});
	});

	describe('POST /logout', () => {
		beforeAll(() => {
			// console.log('****** => ', jwt.sign);
			// const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
			// 	expiresIn: '170h',
			// });
			// userToken = token;
		});

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
