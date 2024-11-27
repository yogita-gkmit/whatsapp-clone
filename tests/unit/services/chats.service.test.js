const chatService = require('../../../src/services/chats.service');
const { Chat, User, UserChat, Message } = require('../../../src/models');
const { reddis } = require('../../../src/config/redis');
const commonHelpers = require('../../../src/helpers/common.helper');
const { sequelize } = require('../../../src/models');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('myTotallySecretKey', {
	encoding: 'base64',
	pbkdf2Iterations: 10000,
	saltLength: 10,
});

jest.mock('../../../src/models');
jest.mock('../../../src/config/redis');
jest.mock('../../../src/helpers/common.helper');
jest.mock('cryptr');

describe('Chat Service Tests', () => {
	const mockTransaction = {
		commit: jest.fn(),
		rollback: jest.fn(),
	};
	const mockChat = {
		id: 1,
		name: 'Test Chat',
		description: 'Test Description',
		type: 'group',
	};
	const mockUser = {
		id: 1,
		name: 'Test User',
		email: 'test@example.com',
		about: 'Test User Profile',
	};
	const mockMessage = {
		id: 1,
		message: 'Test Message',
		user_id: 1,
		chat_id: 1,
		media: null,
	};

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('create', () => {
		it('should create a new single chat successfully', async () => {
			const payload = { type: 'one-to-one', user_ids: [1] };
			const loggedInId = 1;

			User.findByPk.mockResolvedValue(mockUser);
			Chat.create.mockResolvedValue(mockChat);
			UserChat.bulkCreate.mockResolvedValue(true);
			sequelize.transaction.mockResolvedValue(mockTransaction);

			const result = await chatService.create(payload, loggedInId);

			expect(result).toEqual(mockChat);
			expect(Chat.create).toHaveBeenCalled();
			expect(mockTransaction.commit).toHaveBeenCalled();
		});

		it('should throw error if user does not exist', async () => {
			const payload = { type: 'one-to-one', user_ids: [2] };
			const loggedInId = 1;

			User.findByPk.mockResolvedValue(null);
			commonHelpers.customError.mockReturnValue(new Error('User Not Found'));
			await expect(chatService.create(payload, loggedInId)).rejects.toThrow(
				'User Not Found',
			);
		});
	});

	describe('createGroup', () => {
		it('should create a new group chat successfully', async () => {
			const payload = {
				name: 'Test Group',
				description: 'Test Group Description',
				type: 'group',
				user_ids: [1, 2],
			};
			const image = 'test-image.jpg';
			const loggedInId = 1;

			const mockChat = {
				id: 1,
				name: 'Test Chat',
				description: 'Test Description',
				type: 'group',
			};

			Chat.create.mockResolvedValue(mockChat);
			UserChat.create.mockResolvedValue(mockChat);
			sequelize.transaction.mockResolvedValue(mockTransaction);

			const result = await chatService.create(payload, image, loggedInId);

			expect(result).toEqual(mockChat);
			expect(Chat.create).toHaveBeenCalledWith({
				name: 'Test Group',
				description: 'Test Group Description',
				type: 'group',
				image: 'test-image.jpg',
			});
			expect(mockTransaction.commit).toHaveBeenCalled();
		});

		it('should throw error if chat creation fails', async () => {
			const payload = {
				name: 'Test Group',
				description: 'Test Group Description',
				type: 'group',
				user_ids: [1, 2],
			};
			const image = 'test-image.jpg';
			const loggedInId = 1;

			Chat.create.mockResolvedValue(null);
			commonHelpers.customError.mockReturnValue(
				new Error('Chat creation failed'),
			);
			await expect(
				chatService.create(payload, image, loggedInId),
			).rejects.toThrow('Chat creation failed');
		});
	});

	describe('edit', () => {
		it('should edit group chat successfully', async () => {
			const payload = {
				name: 'Updated Group',
				description: 'Updated Description',
			};
			const chatId = 1;
			const loggedInId = 1;
			const image = 'updated-image.jpg';

			const mockChat = {
				id: 1,
				name: 'Updated Group',
				description: 'Updated Description',
				type: 'group',
				image: 'updated-image.jpg',
			};

			Chat.findByPk.mockResolvedValue(mockChat);
			UserChat.findOne.mockResolvedValue({ is_admin: true });
			Chat.update.mockResolvedValue([1, [mockChat]]);
			sequelize.transaction.mockResolvedValue(mockTransaction);

			const result = await chatService.edit(chatId, loggedInId, payload, image);

			console.log('> edit group result ', result);

			expect(result[1][0]).toEqual(mockChat);

			expect(mockTransaction.commit).toHaveBeenCalled();
		});

		it('should throw error if chat does not exist', async () => {
			const payload = {
				name: 'Updated Group',
				description: 'Updated Description',
			};
			const chatId = 1;
			const loggedInId = 1;
			const image = 'updated-image.jpg';

			Chat.findByPk.mockResolvedValue(null);

			commonHelpers.customError.mockReturnValue(
				new Error('Chat does not exist'),
			);
			await expect(
				chatService.edit(chatId, loggedInId, payload, image),
			).rejects.toThrow('Chat does not exist');
		});

		it('should throw error if user is not admin', async () => {
			const payload = {
				name: 'Updated Group',
				description: 'Updated Description',
			};
			const chatId = 1;
			const loggedInId = 1;
			const image = 'updated-image.jpg';

			Chat.findByPk.mockResolvedValue(mockChat);
			UserChat.findOne.mockResolvedValue({ is_admin: false });

			commonHelpers.customError.mockReturnValue(new Error('User is not admin'));
			await expect(
				chatService.edit(chatId, loggedInId, payload, image),
			).rejects.toThrow('User is not admin');
		});
	});

	describe('removeUser', () => {
		it('should remove user from group successfully', async () => {
			const chatId = 1;
			const loggedInId = 1;
			const userId = 2;

			Chat.findByPk.mockResolvedValue(mockChat);
			UserChat.findOne.mockResolvedValue({ is_admin: true });
			UserChat.destroy.mockResolvedValue(true);
			sequelize.transaction.mockResolvedValue(mockTransaction);

			const result = await chatService.removeUser(loggedInId, chatId, userId);

			expect(result).toBe(true); // Expecting undefined since the method now returns nothing
			expect(UserChat.destroy).toHaveBeenCalledWith({
				where: { chat_id: chatId, user_id: userId },
				transaction: mockTransaction,
			});
			expect(mockTransaction.commit).toHaveBeenCalled();
		});

		it('should throw error if user is not an admin', async () => {
			const chatId = 1;
			const loggedInId = 1;
			const userId = 2;

			Chat.findByPk.mockResolvedValue(mockChat);
			UserChat.findOne.mockResolvedValue({ is_admin: false });

			commonHelpers.customError.mockReturnValue(new Error('User is not admin'));
			await expect(
				chatService.removeUser(loggedInId, chatId, userId),
			).rejects.toThrow('User is not admin');
		});
	});

	describe('createMessage', () => {
		it('should create message in chat successfully', async () => {
			const chatId = 1;
			const loggedInId = 1;
			const payload = { message: 'Test message' };
			const media = null;

			Chat.findByPk.mockResolvedValue(mockChat);
			User.findByPk.mockResolvedValue(mockUser);
			UserChat.findOne.mockResolvedValue({ is_admin: true });
			Message.create.mockResolvedValue(mockMessage);
			sequelize.transaction.mockResolvedValue(mockTransaction);

			const result = await chatService.createMessage(
				chatId,
				loggedInId,
				payload,
				media,
			);

			expect(result).toEqual(mockMessage);
			expect(Message.create).toHaveBeenCalledWith(
				{
					user_id: loggedInId,
					chat_id: chatId,
					message: 'Test message',
					media: null,
				},
				{ transaction: mockTransaction },
			);
			expect(mockTransaction.commit).toHaveBeenCalled();
		});

		it('should throw error if user is not in chat', async () => {
			const chatId = 1;
			const loggedInId = 1;
			const payload = { message: 'Test message' };
			const media = null;

			Chat.findByPk.mockResolvedValue(mockChat);
			User.findByPk.mockResolvedValue(mockUser);
			UserChat.findOne.mockResolvedValue(null);

			commonHelpers.customError.mockReturnValue(new Error('User not found'));
			await expect(
				chatService.createMessage(chatId, loggedInId, payload, media),
			).rejects.toThrow('User not found');
		});
	});

	describe('displayMessages', () => {
		it('should display messages successfully', async () => {
			const chatId = 1;
			const loggedInId = 1;
			const page = 0;

			UserChat.findOne.mockResolvedValue({ user_id: loggedInId });

			Message.findAndCountAll.mockResolvedValue({
				rows: [mockMessage],
				count: 1,
			});

			const result = await chatService.displayMessages(
				chatId,
				loggedInId,
				page,
			);

			expect(result.messages).toEqual([mockMessage]);
			expect(Message.findAndCountAll).toHaveBeenCalledWith({
				where: { chat_id: chatId },
				offset: 0,
				limit: 4,
			});
		});

		it('should throw error if user is not in chat', async () => {
			const chatId = 1;
			const loggedInId = 1;
			const page = 0;

			UserChat.findOne.mockResolvedValue(null);

			commonHelpers.customError.mockReturnValue(
				new Error('User not found in chat'),
			);
			await expect(
				chatService.displayMessages(chatId, loggedInId, page),
			).rejects.toThrow('User not found in chat');
		});
	});

	describe('deleteMessage', () => {
		let transactionMock;

		beforeEach(() => {
			transactionMock = { commit: jest.fn(), rollback: jest.fn() };
			sequelize.transaction.mockResolvedValue(transactionMock);

			Message.findAll.mockReset();
			Message.destroy.mockReset();
		});

		it('should delete message successfully', async () => {
			const messageId = 1;
			const loggedInId = 1;

			Message.findAll.mockResolvedValue([{ id: messageId }]);
			Message.destroy.mockResolvedValue(1);

			const result = await chatService.deleteMessage(loggedInId, messageId, 1);

			console.log('> result = ', result);

			expect(result).toBe(1); // Expecting the success message now
			expect(Message.destroy).toHaveBeenCalledWith({
				where: { id: messageId, user_id: loggedInId, chat_id: 1 },
				transaction: expect.any(Object),
			});
			expect(transactionMock.commit).toHaveBeenCalled();
		});

		it('should throw error if message does not exist', async () => {
			const messageId = 1;
			const loggedInId = 1;

			Message.findByPk.mockResolvedValue(null);

			commonHelpers.customError.mockReturnValue(new Error('Message not found'));
			await expect(
				chatService.deleteMessage(loggedInId, messageId, 1),
			).rejects.toThrow('Message not found');
		});
	});
});
