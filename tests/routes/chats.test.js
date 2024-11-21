const request = require('supertest');
const app = require('../../src/index');
const chatsService = require('../../src/services/chats.service');
const { User, sequelize } = require('../../src/models');
const randomstring = require('randomstring');
const jwt = require('jsonwebtoken'); // Add this for generating JWT tokens
let server;

jest.mock('../../src/services/chats.service');

beforeAll(done => {
	server = app.listen(4000, () => {
		done();
	});
});

describe('POST /chats', () => {
	let userToken;
	const userEmail = `${randomstring.generate(10)}@gmail.com`;
	let user;

	beforeAll(async () => {
		await require('../setup')();

		const registerResponse = await request(app)
			.post('/api/auth/register')
			.field('name', 'Test User')
			.field('email', userEmail)
			.field('about', 'Test user for chat API tests')
			.attach('image', Buffer.from('dummy image content'), 'image.jpg');

		expect(registerResponse.statusCode).toEqual(200);
		expect(registerResponse.body).toHaveProperty(
			'message',
			'User has been successfully created',
		);

		const otpResponse = await request(app)
			.post('/api/auth/sendOtp')
			.send({ email: userEmail });

		expect(otpResponse.statusCode).toEqual(200);
		expect(otpResponse.body).toHaveProperty('success', true);
		expect(otpResponse.body.message).toHaveProperty('otp');
		const testOtp = otpResponse.body.message.otp;

		const verifyOtpResponse = await request(app)
			.post('/api/auth/verifyOtp')
			.send({ email: userEmail, otp: testOtp });

		expect(verifyOtpResponse.statusCode).toEqual(200);
		expect(verifyOtpResponse.body).toHaveProperty(
			'message',
			'User verified successfully',
		);
		userToken = verifyOtpResponse.body.token;
	});

	afterAll(async () => {
		await User.destroy({ where: { email: userEmail } });
		await require('../tearDown')();
		await new Promise(resolve => server.close(resolve));
	});

	describe('Create one-to-one chat', () => {
		it('should create a one-to-one chat successfully', async () => {
			const payload = {
				type: 'one-to-one',
				user_ids: [2],
				name: 'Chat with John',
			};
			const response = { chatId: 1 };

			chatsService.createSingle.mockResolvedValue(response);

			const res = await request(app)
				.post('/chats')
				.set('authorization', userToken)
				.send(payload);

			expect(res.statusCode).toEqual(201);
			expect(res.body.message).toBe('User has been successfully created');
			expect(res.body.response).toEqual(response);
			expect(chatsService.createSingle).toHaveBeenCalledWith(
				payload,
				undefined,
				expect.any(Number),
			);
		});

		it('should throw an error if user does not exist', async () => {
			const payload = {
				type: 'one-to-one',
				user_ids: [999],
				name: 'Chat with John',
			};

			chatsService.createSingle.mockRejectedValue(new Error('User Not Found'));

			const res = await request(app)
				.post('/chats')
				.set('authorization', userToken)
				.send(payload);

			expect(res.statusCode).toEqual(404);
			expect(res.body.message).toBe('User Not Found');
		});
	});

	describe('Create group chat', () => {
		it('should create a group chat successfully', async () => {
			const payload = {
				type: 'group',
				name: 'Test Group',
				description: 'Group chat description',
				user_ids: [2, 3],
			};
			const response = { chatId: 2 };

			chatsService.createGroup.mockResolvedValue(response);

			const res = await request(app)
				.post('/chats')
				.set('authorization', userToken)
				.send(payload);

			expect(res.statusCode).toEqual(201);
			expect(res.body.message).toBe('User has been successfully created');
			expect(res.body.response).toEqual(response);
			expect(chatsService.createGroup).toHaveBeenCalledWith(
				payload,
				undefined,
				expect.any(Number),
			);
		});

		it('should throw an error if chat creation fails', async () => {
			const payload = {
				type: 'group',
				name: 'Test Group',
				description: 'Group chat description',
				user_ids: [2, 3],
			};

			chatsService.createGroup.mockRejectedValue(
				new Error('Chat creation failed'),
			);

			const res = await request(app)
				.post('/chats')
				.set('authorization', userToken)
				.send(payload);

			expect(res.statusCode).toEqual(400);
			expect(res.body.message).toBe('Chat creation failed');
		});
	});

	describe('Route validation and missing fields', () => {
		it('should return 400 if payload is missing required fields', async () => {
			const payload = {};

			const res = await request(app)
				.post('/chats')
				.set('authorization', userToken)
				.send(payload);

			expect(res.statusCode).toEqual(400);
			expect(res.body.message).toBe(
				'Validation failed: Missing required fields',
			);
		});

		it('should return 400 if invalid image is uploaded for group chat', async () => {
			const payload = {
				type: 'group',
				name: 'Invalid Image Group',
				description: 'Invalid image file test',
				user_ids: [2, 3],
			};

			const res = await request(app)
				.post('/chats')
				.set('authorization', userToken)
				.field('type', 'group')
				.field('name', 'Invalid Image Group')
				.field('description', 'Invalid image file test')
				.field('user_ids', [2, 3])
				.attach(
					'image',
					Buffer.from('dummy image content'),
					'invalid-image.jpg',
				);

			expect(res.statusCode).toEqual(400);
			expect(res.body.message).toBe('Invalid image file');
		});
	});
});
