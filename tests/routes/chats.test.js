const request = require('supertest');
const app = require('../../src/index');
const chatsService = require('../../src/services/chats.service');
const {
	User,
	Chat,
	Message,
	UserChat,
	sequelize,
} = require('../../src/models');
const randomstring = require('randomstring');
const commonHelpers = require('../../src/helpers/common.helper');

let server;

beforeAll(done => {
	server = app.listen(7000, () => {
		done();
	});
});

describe('POST /chats', () => {
	let userToken;
	const userEmail = `${randomstring.generate(10)}@gmail.com`;

	beforeAll(async () => {
		await require('../setup')();

		const registerResponse = await request(app)
			.post('/api/auth/register')
			.field('name', 'Test User')
			.field('email', userEmail)
			.field('about', 'Test user for chat API tests')
			.attach('image', Buffer.from('dummy image content'), 'image.jpg');

		expect(registerResponse.statusCode).toBe(200);
		expect(registerResponse.body).toHaveProperty(
			'message',
			'User has been successfully created',
		);

		const otpResponse = await request(app)
			.post('/api/auth/sendOtp')
			.send({ email: userEmail });

		expect(otpResponse.statusCode).toBe(200);
		expect(otpResponse.body).toHaveProperty('success', true);
		const testOtp = otpResponse.body.message.otp;

		const verifyOtpResponse = await request(app)
			.post('/api/auth/verifyOtp')
			.send({ email: userEmail, otp: testOtp });

		expect(verifyOtpResponse.statusCode).toBe(200);
		expect(verifyOtpResponse.body).toHaveProperty(
			'message',
			'User verified successfully',
		);
		userToken = verifyOtpResponse.body.token;
		expect(userToken).toBeDefined(); // Ensure the token is assigned
	});

	afterAll(async () => {
		User.destroy = jest.fn().mockResolvedValue(true);
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
				name: 'Test User',
				image: 'test.jpg',
				about: 'Test user for group chat',
			});
			const name = 'Test User';
			const image = 'test.jpg';
			const description = 'Test user for group chat';
			Chat.create = jest.fn().mockResolvedValue({
				id: 1,
				name: 'Group A',
				image: 'groupImage.png',
				description: 'A test group',
				type: 'group',
			});

			UserChat.create = jest.fn().mockResolvedValue(true);
			const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
			sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);

			const chat = await chatsService.create(payload, loggedInId);

			expect(chat).toHaveProperty('id');
			expect(UserChat.create).toHaveBeenCalledTimes(2);
			expect(mockTransaction.commit).toHaveBeenCalled();
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

			User.findByPk = jest.fn().mockResolvedValue({
				name: 'Test User',
				image: 'test.jpg',
				about: 'Test user for group chat',
			});

			Chat.create = jest.fn().mockResolvedValue({
				id: 1,
				name: 'Group A',
				image: 'groupImage.png',
				description: 'A test group',
				type: 'group',
			});

			UserChat.create = jest.fn().mockResolvedValue(true);

			const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
			sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);

			const chat = await chatsService.create(payload, image, loggedInId);

			expect(chat).toHaveProperty('id');
			expect(UserChat.create).toHaveBeenCalledTimes(3);
			expect(mockTransaction.commit).toHaveBeenCalled();
		});
	});

	describe('removeUser', () => {
		it('should remove a user from the group successfully', async () => {
			const id = 1;
			const userId = 2;
			const loggedInId = 1;

			Chat.findByPk = jest.fn().mockResolvedValue({
				id: id,
				type: 'group',
				name: 'Test Group',
				description: 'A test group chat',
			});

			UserChat.findOne = jest.fn().mockResolvedValue({ is_admin: true });

			const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
			sequelize.transaction = jest.fn().mockResolvedValue(mockTransaction);

			UserChat.destroy = jest.fn().mockResolvedValue(1);

			const result = await chatsService.removeUser(loggedInId, id, userId);

			expect(result).toBe(1);
			expect(UserChat.destroy).toHaveBeenCalledWith(
				expect.objectContaining({
					where: { chat_id: id, user_id: userId },
					transaction: mockTransaction,
				}),
			);
		});
	});

	describe('createMessage', () => {
		it('should create a message successfully', async () => {
			const id = 1;
			const userId = 2;
			const payload = { message: 'Hello!' };
			const media = null;

			Chat.findByPk = jest.fn().mockResolvedValue({
				id: id,
				name: 'Group A',
				type: 'group',
			});

			Message.create = jest
				.fn()
				.mockResolvedValue({ id: 1, message: 'Hello!' });

			const result = await chatsService.createMessage(
				id,
				userId,
				payload,
				media,
			);

			expect(result).toHaveProperty('id');
			expect(result.message).toBe('Hello!');
		});
	});

	describe('editMessage', () => {
		// it('should edit a message successfully', async () => {
		// 	const id = 1;
		// 	const messageId = 1;
		// 	const userId = 2;
		// 	const payload = { message: 'Updated message' };

		// 	Message.findAll = jest
		// 		.fn()
		// 		.mockResolvedValueOnce([
		// 			{ id: messageId, user_id: userId, message: 'Hello' },
		// 		]);
		// 	Message.update = jest
		// 		.fn()
		// 		.mockResolvedValueOnce([
		// 			1,
		// 			[{ id: messageId, user_id: userId, message: 'Updated message' }],
		// 		]);

		// 	const result = await chatsService.editMessage(
		// 		id,
		// 		messageId,
		// 		userId,
		// 		payload,
		// 		null,
		// 	);

		// 	console.log('>>>>>>>>result', result);

		// 	expect(result).toHaveProperty('message', 'Updated message');
		// });

		it('should throw error if user cannot edit message', async () => {
			const id = 1;
			const messageId = 2;
			const userId = 2;
			const payload = { message: 'Updated message' };

			Message.findAll = jest
				.fn()
				.mockResolvedValue([{ id: messageId, user_id: 1 }]);

			await expect(
				chatsService.editMessage(id, messageId, userId, payload, null),
			).rejects.toThrow(
				commonHelpers.customError('user can not edit this message', 403),
			);
		});
	});

	describe('displayMessages', () => {
		it('should return messages with pagination', async () => {
			const id = 1;
			const userId = 2;
			const page = 0;
			const filter = 'message';

			Message.findAndCountAll = jest
				.fn()
				.mockResolvedValue({ rows: [{ message: 'Hello' }], count: 1 });

			const response = await chatsService.displayMessages(
				id,
				userId,
				page,
				filter,
			);

			expect(response.messages).toHaveLength(1);
		});

		it('should throw error if user does not have access to chat', async () => {
			const id = 1;
			const userId = 999;

			UserChat.findOne = jest.fn().mockResolvedValue(null);

			await expect(
				chatsService.displayMessages(id, userId, 0, ''),
			).rejects.toThrow(
				commonHelpers.customError('user can not access this chat', 403),
			);
		});
	});
});
