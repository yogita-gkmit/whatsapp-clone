const chatService = require('../../../src/services/chats.service');
const { Op } = require('sequelize');
const { Chat, User, UserChat, Message } = require('../../../src/models');
const { reddis } = require('../../../src/config/redis');
const commonHelpers = require('../../../src/helpers/common.helper');
const { sequelize } = require('../../../src/models');
const mail = require('../../../src/helpers/email.helper');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(
	'l9LiGUhZtyArRXKHv0LFabHLQoIjkgqlHYVJHYh+/qjBgOkmi7Sb9c8erg==encrypted-token',
	{
		encoding: 'base64',
		pbkdf2Iterations: 10000,
		saltLength: 10,
	},
);

jest.mock('cryptr', () => {
	return jest.fn().mockImplementation(() => ({
		encrypt: jest
			.fn()
			.mockReturnValue(
				'l9LiGUhZtyArRXKHv0LFabHLQoIjkgqlHYVJHYh+/qjBgOkmi7Sb9c8erg==encrypted-token',
			),
	}));
});

jest.mock('../../../src/models');
jest.mock('../../../src/config/redis');
jest.mock('../../../src/helpers/common.helper');
jest.mock('../../../src/helpers/email.helper', () => ({
	invite: jest.fn(),
}));

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
			Chat.findAll.mockResolvedValue([]);
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

			await expect(
				chatService.create(payload, loggedInId),
			).rejects.toThrowError('User Not Found');
		});

		it('should throw error if chat already exists', async () => {
			const payload = { type: 'one-to-one', user_ids: [1] };
			const loggedInId = 1;

			User.findByPk.mockResolvedValue(mockUser);
			Chat.findAll.mockResolvedValue([mockChat]);
			commonHelpers.customError.mockReturnValue(
				new Error('Chat already exists'),
			);

			await expect(
				chatService.create(payload, loggedInId),
			).rejects.toThrowError('Chat already exists');
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

			expect(result).toBe(true);
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

			expect(result).toBe(1);
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

	describe('removeChat', () => {
		it('should delete chat successfully if user is an admin', async () => {
			const chatId = 1;
			const loggedInId = 1;

			const mockChat = {
				destroy: jest.fn().mockResolvedValue(1),
			};

			Chat.findByPk.mockResolvedValue(mockChat);
			UserChat.findOne.mockResolvedValue({ is_admin: true });
			sequelize.transaction.mockResolvedValue(mockTransaction);

			const result = await chatService.remove(loggedInId, chatId);

			expect(result).toBe(1);
			expect(mockChat.destroy).toHaveBeenCalled();
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
				chatService.remove(loggedInId, chatId, userId),
			).rejects.toThrow('User is not admin');
		});
	});

	describe('displayMessages', () => {
		it('should return empty array if no messages in chat', async () => {
			const chatId = 1;
			const loggedInId = 1;
			const page = 0;

			UserChat.findOne.mockResolvedValue({ user_id: loggedInId });
			Message.findAndCountAll.mockResolvedValue({
				rows: [],
				count: 0,
			});

			const result = await chatService.displayMessages(
				chatId,
				loggedInId,
				page,
			);

			expect(result.messages).toEqual([]);
		});
	});

	describe('createMessage', () => {
		it('should throw error if message is empty', async () => {
			const chatId = 1;
			const loggedInId = 1;
			const payload = { message: '' };
			const media = null;

			commonHelpers.customError.mockReturnValue(
				new Error('Message cannot be empty'),
			);

			await expect(
				chatService.createMessage(chatId, loggedInId, payload, media),
			).rejects.toThrow('Message cannot be empty');
		});
	});

	describe('find', () => {
		let mockChat;
		let mockUserChat;
		let mockUser;

		beforeEach(() => {
			mockChat = {
				id: 1,
				type: 'private',
				findByPk: jest.fn(),
			};
			mockUserChat = {
				id: 1,
				user_id: 2,
				chat_id: 1,
			};
			mockUser = {
				id: 2,
				name: 'John Doe',
			};

			Chat.findByPk.mockClear();
			UserChat.findAll.mockClear();
			User.findByPk.mockClear();
			commonHelpers.customError.mockClear();
			commonHelpers.customError.mockImplementation((message, code) => {
				const error = new Error(message);
				error.code = code;
				throw error;
			});
		});

		it('should throw error if chat does not exist', async () => {
			Chat.findByPk.mockResolvedValue(null);

			await expect(chatService.find(1, 1)).rejects.toThrowError(
				'Chat does not exist',
			);
			expect(Chat.findByPk).toHaveBeenCalledWith(1);
		});

		it('should return the chat when chat type is group', async () => {
			mockChat.type = 'group';
			Chat.findByPk.mockResolvedValue(mockChat);

			const result = await chatService.find(1, 1);

			expect(result).toEqual(mockChat);
			expect(Chat.findByPk).toHaveBeenCalledWith(1);
		});

		it('should throw error if user is not part of the chat', async () => {
			mockChat.type = 'private';
			Chat.findByPk.mockResolvedValue(mockChat);

			UserChat.findAll.mockResolvedValue([{ ...mockUserChat, user_id: 4 }]);

			await expect(chatService.find(1, 3)).rejects.toThrowError(
				'User does not exist in chat',
			);
			expect(UserChat.findAll).toHaveBeenCalledWith({ chat_id: 1 });
		});
	});

	describe('editRole', () => {
		let mockChat;
		let mockUserChat;
		let mockUser;
		let mockTransaction;

		beforeEach(() => {
			mockChat = {
				id: 1,
				type: 'group',
			};

			mockUserChat = {
				user_id: 1,
				chat_id: 1,
				is_admin: true,
			};

			mockUser = {
				id: 1,
				name: 'Admin User',
				email: 'admin@example.com',
			};

			mockTransaction = {
				commit: jest.fn(),
				rollback: jest.fn(),
			};

			jest.clearAllMocks();

			Chat.findByPk.mockResolvedValue(mockChat);
			UserChat.findOne.mockResolvedValue(mockUserChat);
			UserChat.update.mockResolvedValue([1, [mockUserChat]]);
			sequelize.transaction.mockResolvedValue(mockTransaction);
			commonHelpers.customError.mockImplementation((message, code) => {
				const error = new Error(message);
				error.code = code;
				throw error;
			});
		});

		it('should successfully update the role of users in the group chat', async () => {
			const chatId = 1;
			const loggedInUserId = 1;
			const payload = {
				user_ids: [2, 3],
			};

			UserChat.findOne.mockResolvedValueOnce({ is_admin: true });

			const result = await chatService.editRole(
				chatId,
				loggedInUserId,
				payload,
			);

			expect(result).toEqual([1, [mockUserChat]]);
			expect(UserChat.update).toHaveBeenCalled();
			expect(mockTransaction.commit).toHaveBeenCalled();
		});

		it('should throw error if chat does not exist', async () => {
			Chat.findByPk.mockResolvedValueOnce(null);

			const chatId = 1;
			const loggedInUserId = 1;
			const payload = { user_ids: [2, 3] };

			commonHelpers.customError.mockReturnValue(
				new Error('Chat does not exist'),
			);

			await expect(
				chatService.editRole(chatId, loggedInUserId, payload),
			).rejects.toThrowError('Chat does not exist');
		});
		it('should throw error if the chat is of type "single"', async () => {
			const payload = { user_ids: [2, 3] };
			const chatId = 1;
			const loggedInUserId = 1;

			Chat.findByPk.mockResolvedValue({ id: 1, type: 'one-to-one' });

			await expect(
				chatService.editRole(chatId, loggedInUserId, payload),
			).rejects.toThrowError('Not applicable for one to one conversation');
		});

		it('should throw error if logged-in user is not an admin', async () => {
			UserChat.findOne.mockResolvedValueOnce({ is_admin: false });

			const chatId = 1;
			const loggedInUserId = 1;
			const payload = { user_ids: [2, 3] };

			commonHelpers.customError.mockReturnValue(new Error('User is not admin'));

			await expect(
				chatService.editRole(chatId, loggedInUserId, payload),
			).rejects.toThrowError('User is not admin');
		});

		it('should throw error if any of the users do not exist in the chat', async () => {
			UserChat.findOne.mockResolvedValueOnce(null);

			const chatId = 1;
			const loggedInUserId = 1;
			const payload = { user_ids: [2, 3] };

			commonHelpers.customError.mockReturnValue(new Error('User not found'));

			await expect(
				chatService.editRole(chatId, loggedInUserId, payload),
			).rejects.toThrowError('User not found');
		});
	});

	describe('invite', () => {
		beforeEach(() => {
			jest.clearAllMocks();

			commonHelpers.customError.mockImplementation((message, code) => {
				const error = new Error(message);
				error.code = code;
				throw error;
			});

			Cryptr.mockImplementation(() => ({
				encrypt: jest
					.fn()
					.mockReturnValue(
						'l9LiGUhZtyArRXKHv0LFabHLQoIjkgqlHYVJHYh+/qjBgOkmi7Sb9c8erg==encrypted-token',
					),
			}));
		});

		it('should throw error if id is not provided', async () => {
			const payload = { user_id: 2 };
			const chatId = 1;
			const id = null;

			await expect(
				chatService.invite(chatId, id, payload),
			).rejects.toThrowError('Token does not exists');
		});

		it('should throw error if chat does not exist', async () => {
			const payload = { user_id: 2 };
			const chatId = 1;
			const id = 1;

			Chat.findByPk.mockResolvedValue(null);

			await expect(
				chatService.invite(chatId, id, payload),
			).rejects.toThrowError('User does not exist');
		});

		it('should throw error if user is not found in the chat', async () => {
			const payload = { user_id: 2 };
			const chatId = 1;
			const id = 1;

			Chat.findByPk.mockResolvedValue({ id: chatId, type: 'group' });
			UserChat.findOne.mockResolvedValue(null);

			await expect(
				chatService.invite(chatId, id, payload),
			).rejects.toThrowError('User not found');
		});

		it('should throw error if user is not admin in the chat', async () => {
			const payload = { user_id: 2 };
			const chatId = 1;
			const id = 1;

			Chat.findByPk.mockResolvedValue({ id: chatId, type: 'group' });
			UserChat.findOne.mockResolvedValue({
				chat_id: chatId,
				user_id: id,
				is_admin: false,
			});

			await expect(
				chatService.invite(chatId, id, payload),
			).rejects.toThrowError('User is not admin');
		});

		it('should throw error if the user to invite does not exist', async () => {
			const payload = { user_id: 2 };
			const chatId = 1;
			const id = 1;

			Chat.findByPk.mockResolvedValue({ id: chatId, type: 'group' });
			UserChat.findOne.mockResolvedValue({
				chat_id: chatId,
				user_id: id,
				is_admin: true,
			});
			User.findByPk.mockResolvedValue(null);

			await expect(
				chatService.invite(chatId, id, payload),
			).rejects.toThrowError('User does not exist');
		});

		it('should generate token and send invite email successfully', async () => {
			const payload = { user_id: 2 };
			const chatId = 1;
			const id = 1;

			const user = { id: 2, email: 'user@example.com' };
			const encryptedToken =
				'l9LiGUhZtyArRXKHv0LFabHLQoIjkgqlHYVJHYh+/qjBgOkmi7Sb9c8erg==encrypted-token';

			Chat.findByPk.mockResolvedValue({
				id: chatId,
				type: 'group',
				name: 'Test Chat',
			});
			UserChat.findOne.mockResolvedValue({
				chat_id: chatId,
				user_id: id,
				is_admin: true,
			});
			User.findByPk.mockResolvedValue(user);

			reddis.set.mockResolvedValue(true);
			mail.invite.mockResolvedValue(true);

			const result = await chatService.invite(chatId, id, payload);

			expect(result).toBe(encryptedToken);

			const cryptrInstance = Cryptr.mock.instances[0];

			expect(reddis.set).toHaveBeenCalledWith(
				user.id,
				encryptedToken,
				'ex',
				60 * 60 * 24,
			);

			expect(mail.invite).toHaveBeenCalledWith(
				undefined,
				encryptedToken,
				user.email,
				chatId,
			);
		});
	});
});
