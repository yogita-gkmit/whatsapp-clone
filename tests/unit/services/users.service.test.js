const { User, UserChat, Message } = require('../../../src/models');
const { sequelize } = require('../../../src/models');
const commonHelpers = require('../../../src/helpers/common.helper');
const chatService = require('../../../src/services/users.service');

jest.mock('../../../src/models');
jest.mock('../../../src/helpers/common.helper');
jest.mock('sequelize');

describe('User Service Tests', () => {
  const mockUser = {
    id: 1,
    name: 'Test User',
    image: 'test-image.jpg',
    email: 'test@example.com',
    about: 'Test about',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('profile', () => {
    it('should return user profile successfully', async () => {
      User.findByPk.mockResolvedValue(mockUser);

      const result = await chatService.profile(1);

      expect(result).toEqual({
        user: {
          id: 1,
          name: 'Test User',
          image: 'test-image.jpg',
          email: 'test@example.com',
          about: 'Test about',
          created_at: expect.any(Date),
          updated_at: expect.any(Date),
        },
      });
    });

    it('should throw error if user does not exist', async () => {
      User.findByPk.mockResolvedValue(null);

      await commonHelpers.customError('User Not Found',404);
    });
  });

  describe('editProfile', () => {
    it('should edit user profile successfully', async () => {
      const payload = { name: 'Updated Name', email: 'updated@example.com', about: 'Updated about' };
      const image = 'updated-image.jpg';
      const user = { ...mockUser, ...payload };

      User.findByPk.mockResolvedValue(mockUser);
      User.update.mockResolvedValue([1, [user]]);
      sequelize.transaction.mockResolvedValue(mockTransaction);

      const result = await chatService.editProfile(1, image, payload);

      expect(result[1][0]).toEqual(user);
      expect(User.update).toHaveBeenCalledWith(
        { image, name: payload.name, email: payload.email, about: payload.about },
        {
          where: { id: 1 },
          returning: true,
          transaction: mockTransaction,
        }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should throw error if user does not exist', async () => {
      const payload = { name: 'Updated Name', email: 'updated@example.com', about: 'Updated about' };
      User.findByPk.mockResolvedValue(null);

      await commonHelpers.customError('user does not exist',404);
    });

    it('should handle transaction rollback in case of error', async () => {
      const payload = { name: 'Updated Name', email: 'updated@example.com', about: 'Updated about' };
      User.findByPk.mockResolvedValue(mockUser);
      User.update.mockRejectedValue(new Error('Database error'));
      sequelize.transaction.mockResolvedValue(mockTransaction);

      await expect(chatService.editProfile(1, 'image.jpg', payload)).rejects.toThrow('Database error');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('users', () => {
    it('should return a list of users', async () => {
      User.findByPk.mockResolvedValue(mockUser);
      User.findAll.mockResolvedValue([mockUser]);

      const result = await chatService.users(1);

      expect(result).toEqual([mockUser]);
      expect(User.findAll).toHaveBeenCalledWith({
        where: { id: { [Op.not]: 1 } },
        attributes: { exclude: ['email'] },
        offset: 0,
        limit: 10,
      });
    });

    it('should throw error if user does not exist', async () => {
      User.findByPk.mockResolvedValue(null);

      await commonHelpers.customError('user does not exist',404);
    });
  });

  describe('inbox', () => {
    it('should return the inbox with chats and last message', async () => {
      const mockUserChat = { chat_id: 1, user_id: 1 };
      const mockChats = [
        { id: 1, name: 'Chat 1', description: 'Description', image: 'chat-image.jpg', type: 'group' },
      ];

      const mockLastMessage = [
        {
          message: 'Last message',
          media: null,
          created_at: new Date(),
        },
      ];

      User.findByPk.mockResolvedValue(mockUser);
      UserChat.findAll.mockResolvedValue([mockUserChat]);
      sequelize.query.mockResolvedValue([[mockChats, mockLastMessage]]);

      const result = await chatService.inbox(1, 1);

      expect(result).toEqual({
        results: [
          {
            chat_id: 1,
            chat_name: 'Chat 1',
            description: 'Description',
            chat_image: 'chat-image.jpg',
            type: 'group',
            last_message: 'Last message',
            last_media: null,
            last_message_created_at: expect.any(Date),
            user_name: null,
            user_image: null,
            user_about: null,
          },
        ],
      });
      expect(sequelize.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          replacements: { id: 1, offset: 0, limit: 10 },
        })
      );
    });

    it('should throw error if user does not exist', async () => {
      User.findByPk.mockResolvedValue(null);

      await commonHelpers.customError('user does not exist',404);
    });

    it('should throw error if logged-in user does not match the requested user', async () => {
      User.findByPk.mockResolvedValue(mockUser);

      await commonHelpers.customError('Invalid user',400);
    });
  });
});
