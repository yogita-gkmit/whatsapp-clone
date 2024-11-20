const request = require('supertest');
const app = require('../../src/index');
const chatsService = require('../../src/services/chats.service');
const { User, Chat, UserChat, sequelize } = require('../../src/models');
const randomstring = require('randomstring');
const jwt = require('jsonwebtoken');
let server;

const commonHelpers = require('../../src/helpers/common.helper');

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

	const mockAuthMiddleware = (req, res, next) => {
		req.user = { id: 1 };
		next();
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});
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

	describe('createSingle', () => {
		it('should create a single chat successfully', async () => {
			const payload = {
				type: 'one-to-one',
				user_ids: [1],
			};
			const loggedInId = 2;

			User.findByPk = jest.fn().mockResolvedValue({
				name: 'John Doe',
				image: 'image.jpg',
				about: 'Hello',
			});

			const chat = await chatsService.createSingle(payload, loggedInId);

			expect(chat).toHaveProperty('id');
			expect(chat).toHaveProperty('name', 'John Doe');
			expect(UserChat.bulkCreate).toHaveBeenCalled();
		});

		it('should throw error if user does not exist', async () => {
			const payload = { type: 'one-to-one', user_ids: [999] };
			const loggedInId = 2;

			User.findByPk = jest.fn().mockResolvedValue(null);

			await expect(
				chatsService.createSingle(payload, loggedInId),
			).rejects.toThrow(commonHelpers.customError('User does not found', 404));
		});
	});

	describe('createGroup', () => {
		it('should create a group chat successfully', async () => {
			const payload = {
				name: 'Group A',
				description: 'A test group',
				type: 'group',
				user_ids: [1, 2],
			};
			const image = 'groupImage.png';
			const loggedInId = 3;

			const chat = await chatsService.createGroup(payload, image, loggedInId);

			expect(chat).toHaveProperty('id');
			expect(UserChat.create).toHaveBeenCalledTimes(3);
		});

		it('should throw error if chat creation fails', async () => {
			const payload = {
				name: 'Group B',
				description: 'Another test group',
				type: 'group',
				user_ids: [1],
			};
			const image = null;
			const loggedInId = 2;

			Chat.create = jest.fn().mockResolvedValue(null);

			await expect(
				chatsService.createGroup(payload, image, loggedInId),
			).rejects.toThrow(commonHelpers.customError('Chat creation failed', 400));
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

	describe('removeUser', () => {
		it('should remove a user from the group successfully', async () => {
			const chatId = 1;
			const userId = 2;
			const loggedInId = 1;

			UserChat.findOne = jest.fn().mockResolvedValue({ is_admin: true });
			UserChat.destroy = jest.fn().mockResolvedValue(1);

			const result = await chatsService.removeUser(loggedInId, chatId, userId);

			expect(result).toBe(1);
		});

		it('should throw error if user is not admin', async () => {
			const chatId = 1;
			const userId = 2;
			const loggedInId = 3;

			UserChat.findOne = jest.fn().mockResolvedValue({ is_admin: false });

			await expect(
				chatsService.removeUser(loggedInId, chatId, userId),
			).rejects.toThrow(commonHelpers.customError('User is not admin', 403));
		});
	});

	describe('createMessage', () => {
		it('should create a message successfully', async () => {
			const chatId = 1;
			const userId = 2;
			const payload = { message: 'Hello!' };
			const media = null;

			Message.create = jest
				.fn()
				.mockResolvedValue({ id: 1, message: 'Hello!' });

			const result = await chatsService.createMessage(
				chatId,
				userId,
				payload,
				media,
			);

			expect(result).toHaveProperty('id');
			expect(result.message).toBe('Hello!');
		});

		it('should throw error if message is empty', async () => {
			const chatId = 1;
			const userId = 2;
			const payload = { message: '' };

			await expect(
				chatsService.createMessage(chatId, userId, payload, null),
			).rejects.toThrow(
				commonHelpers.customError('message should not be empty', 422),
			);
		});
	});

	describe('editMessage', () => {
		it('should edit a message successfully', async () => {
			const chatId = 1;
			const messageId = 1;
			const userId = 2;
			const payload = { message: 'Updated message' };

			Message.findAll = jest.fn().mockResolvedValue([{ id: 1 }]);
			Message.update = jest
				.fn()
				.mockResolvedValue([1, { message: 'Updated message' }]);

			const result = await chatsService.editMessage(
				chatId,
				messageId,
				userId,
				payload,
				null,
			);

			expect(result).toHaveProperty('message', 'Updated message');
		});

		it('should throw error if user cannot edit message', async () => {
			const chatId = 1;
			const messageId = 2;
			const userId = 2;
			const payload = { message: 'Updated message' };

			Message.findAll = jest.fn().mockResolvedValue([{ id: 1 }]);

			await expect(
				chatsService.editMessage(chatId, messageId, userId, payload, null),
			).rejects.toThrow(
				commonHelpers.customError('user can not edit this message', 403),
			);
		});
	});

	describe('displayMessages', () => {
		it('should return messages with pagination', async () => {
			const chatId = 1;
			const userId = 2;
			const page = 0;
			const filter = 'message';

			Message.findAll = jest.fn().mockResolvedValue([{ message: 'Hello' }]);

			const messages = await chatsService.displayMessages(
				chatId,
				userId,
				page,
				filter,
			);

			expect(messages).toHaveLength(1);
		});

		it('should throw error if user does not have access to chat', async () => {
			const chatId = 1;
			const userId = 999;

			UserChat.findOne = jest.fn().mockResolvedValue(null);

			await expect(
				chatsService.displayMessages(chatId, userId, 0, ''),
			).rejects.toThrow(
				commonHelpers.customError('user can not access this chat', 403),
			);
		});
	});
});
