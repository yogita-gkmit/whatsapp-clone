const chatService = require('../../../src/services/chats.service');
const { Chat, User, UserChat, Message } = require('../../../src/models');
const { reddis } = require('../../../src/config/redis');
const commonHelpers = require('../../../src/helpers/common.helper');
const { sequelize } = require('../../../src/models');
// const commonHelpers = require('../../../src/helpers/common.helper');
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

  describe('createSingle', () => {
    it('should create a new single chat successfully', async () => {
      const payload = { type: 'one-to-one', user_ids: [1] };
      const loggedInId = 1;

      User.findByPk.mockResolvedValue(mockUser);
      Chat.create.mockResolvedValue(mockChat);
      UserChat.bulkCreate.mockResolvedValue(true);
      sequelize.transaction.mockResolvedValue(mockTransaction);

      const result = await chatService.createSingle(payload, loggedInId);

      expect(result).toEqual(mockChat);
      expect(Chat.create).toHaveBeenCalledWith(
        { name: mockUser.name, image: mockUser.image, description: mockUser.about, type: 'one-to-one' },
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should throw error if user does not exist', async () => {
      const payload = { type: 'one-to-one', user_ids: [2] };
      const loggedInId = 1;

      User.findByPk.mockResolvedValue(null);

      await commonHelpers.customError('User does not found',404);
    });
  });

  describe('createGroup', () => {
    it('should create a new group chat successfully', async () => {
      const payload = { name: 'Test Group', description: 'Test Group Description', type: 'group', user_ids: [1, 2] };
      const image = 'test-image.jpg';
      const loggedInId = 1;

      Chat.create.mockResolvedValue(mockChat);
      UserChat.create.mockResolvedValue(true);
      sequelize.transaction.mockResolvedValue(mockTransaction);

      const result = await chatService.createGroup(payload, image, loggedInId);

      expect(result).toEqual(mockChat);
      expect(Chat.create).toHaveBeenCalledWith(
        { name: 'Test Group', description: 'Test Group Description', type: 'group', image: 'test-image.jpg' }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should throw error if chat creation fails', async () => {
      const payload = { name: 'Test Group', description: 'Test Group Description', type: 'group', user_ids: [1, 2] };
      const image = 'test-image.jpg';
      const loggedInId = 1;

      Chat.create.mockResolvedValue(null);

      await commonHelpers.customError('Chat creation failed', 400);
    });
  });

  describe('edit', () => {
    it('should edit group chat successfully', async () => {
      const payload = { name: 'Updated Group', description: 'Updated Description' };
      const chatId = 1;
      const loggedInId = 1;
      const image = 'updated-image.jpg';

      Chat.findByPk.mockResolvedValue(mockChat);
      UserChat.findOne.mockResolvedValue({ is_admin: true });
      Chat.update.mockResolvedValue([1, [mockChat]]);
      sequelize.transaction.mockResolvedValue(mockTransaction);

      const result = await chatService.edit(chatId, loggedInId, payload, image);

      expect(result[1][0]).toEqual(mockChat);
      expect(Chat.update).toHaveBeenCalledWith(
        { name: 'Updated Group', image: 'updated-image.jpg', description: 'Updated Description' },
        { where: { id: chatId }, returning: true, transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should throw error if chat does not exist', async () => {
      const payload = { name: 'Updated Group', description: 'Updated Description' };
      const chatId = 1;
      const loggedInId = 1;

      Chat.findByPk.mockResolvedValue(null);

      await commonHelpers.customError('Chat does not exist',404);
    });

    it('should throw error if user is not admin', async () => {
      const payload = { name: 'Updated Group', description: 'Updated Description' };
      const chatId = 1;
      const loggedInId = 1;

      Chat.findByPk.mockResolvedValue(mockChat);
      UserChat.findOne.mockResolvedValue({ is_admin: false });

      await commonHelpers.customError('User is not admin',403);
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

      expect(result).toBeUndefined();
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

      await commonHelpers.customError('User is not admin',403);
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

      const result = await chatService.createMessage(chatId, loggedInId, payload, media);

      expect(result).toEqual(mockMessage);
      expect(Message.create).toHaveBeenCalledWith(
        { user_id: loggedInId, chat_id: chatId, message: 'Test message', media: null },
        { transaction: mockTransaction }
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

      await commonHelpers.customError('User not found',404);
    });
  });

  describe('displayMessages', () => {
    it('should display messages successfully', async () => {
      const chatId = 1;
      const loggedInId = 1;
      const page = 0;

      UserChat.findOne.mockResolvedValue({ user_id: loggedInId });
      Message.findAll.mockResolvedValue([mockMessage]);

      const result = await chatService.displayMessages(chatId, loggedInId, page);

      expect(result).toEqual([mockMessage]);
      expect(Message.findAll).toHaveBeenCalledWith({
        where: { chat_id: chatId },
        offset: 0,
        limit: 10,
      });
    });

    it('should throw error if user is not in chat', async () => {
      const chatId = 1;
      const loggedInId = 1;

      UserChat.findOne.mockResolvedValue(null);

      await commonHelpers.customError('User not found in chat',404);
    });
  });

  describe('deleteMessage', () => {
    it('should delete message successfully', async () => {
      const messageId = 1;
      const loggedInId = 1;

      Message.findByPk.mockResolvedValue(mockMessage);
      Message.destroy.mockResolvedValue(true);

      const result = await chatService.deleteMessage(loggedInId, messageId);

      expect(result).toBeUndefined();
      expect(Message.destroy).toHaveBeenCalledWith({ where: { id: messageId } });
    });

    it('should throw error if message does not exist', async () => {
      const messageId = 1;
      const loggedInId = 1;

      Message.findByPk.mockResolvedValue(null);

      await commonHelpers.customError('Message not found',404);
    });
  });
});
