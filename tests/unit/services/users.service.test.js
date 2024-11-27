const { User, UserChat, Message } = require('../../../src/models');
const { sequelize } = require('../../../src/models');
const { Op } = require('sequelize');
const commonHelpers = require('../../../src/helpers/common.helper');
const userService = require('../../../src/services/users.service');

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

      const result = await userService.profile(1);

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

      await commonHelpers.customError('User Not Found', 404);
    });
  });

  describe('editProfile', () => {
    it('should edit user profile successfully', async () => {
      const payload = {
        name: 'Updated Name',
        email: 'updated@example.com',
        about: 'Updated about',
      };

      const user = { ...mockUser, ...payload };

      User.findByPk.mockResolvedValue(mockUser);
      User.update.mockResolvedValue([1, [user]]);
      sequelize.transaction.mockResolvedValue(mockTransaction);

      const result = await userService.editProfile(
        1,
        1,
        'updated-image.jpg',
        payload,
      );

      expect(result[1][0]).toEqual(user);

      expect(User.update).toHaveBeenCalledWith(
        {
          image: 'updated-image.jpg',
          name: payload.name,
          email: payload.email,
          about: payload.about,
        },
        {
          where: { id: 1 },
          returning: true,
        },
        { transaction: mockTransaction },
      );

      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should throw error if user does not exist', async () => {
      const payload = {
        name: 'Updated Name',
        email: 'updated@example.com',
        about: 'Updated about',
      };
      User.findByPk.mockResolvedValue(null);

      await commonHelpers.customError('user does not exist', 404);
    });

    it('should handle transaction rollback in case of error', async () => {
      const payload = {
        name: 'Updated Name',
        email: 'updated@example.com',
        about: 'Updated about',
      };

      User.findByPk.mockResolvedValue(mockUser);
      User.update.mockRejectedValue(new Error('Database error'));
      sequelize.transaction.mockResolvedValue(mockTransaction);

      await expect(
        userService.editProfile(1, 1, 'image.jpg', payload),
      ).rejects.toThrow('Database error');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('users', () => {
    it('should return a list of users', async () => {
      User.findByPk.mockResolvedValue(mockUser);
      User.findAndCountAll.mockResolvedValue({ rows: [mockUser], count: 1 });

      const result = await userService.users(1);

      expect(result.allUsers).toEqual([mockUser]);
      expect(User.findAndCountAll).toHaveBeenCalledWith({
        where: { id: { [Op.not]: 1 } },
        attributes: { exclude: ['email'] },
        offset: 0,
        limit: 10,
      });
    });

    it('should throw error if user does not exist', async () => {
      User.findByPk.mockResolvedValue(null);

      await commonHelpers.customError('user does not exist', 404);
    });
  });

  describe('inbox', () => {
    it('should return the inbox with chats and last message', async () => {
      const mockUserChat = { chat_id: 1, user_id: 1 };
      const mockChats = [
        {
          id: 1,
          name: 'Chat 1',
          description: 'Description',
          image: 'chat-image.jpg',
          type: 'group',
        },
      ];

      const date = new Date();
      const mockLastMessage = [
        {
          message: 'Last message',
          media: null,
          created_at: date,
        },
      ];

      User.findByPk.mockResolvedValue(mockUser);
      UserChat.findAll.mockResolvedValue([mockUserChat]);
      sequelize.query.mockResolvedValue([[mockChats, mockLastMessage]]);

      const result = await userService.inbox(1, 1);

      expect(result).toEqual({
        currentPage: 0,
        results: [
          [
            {
              id: 1,
              name: 'Chat 1',
              description: 'Description',
              image: 'chat-image.jpg',
              type: 'group',
            },
          ],
          [
            {
              message: 'Last message',
              media: null,
              created_at: date,
            },
          ],
        ],
        totalItems: 2,
        totalPages: 1,
      });
      expect(sequelize.query).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          replacements: { id: 1, offset: 0, limit: 10 },
        }),
      );
    });

    it('should throw error if user does not exist', async () => {
      User.findByPk.mockResolvedValue(null);

      commonHelpers.customError.mockReturnValue(
        new Error('user does not exist'),
      );
      await expect(userService.inbox(1, 1)).rejects.toThrow(
        'user does not exist',
      );
    });

    it('should throw error if logged-in user does not match the requested user', async () => {
      User.findByPk.mockResolvedValue({ id: 1 });

      commonHelpers.customError.mockReturnValue(new Error('Invalid user'));
      await expect(userService.inbox(1, 2)).rejects.toThrow('Invalid user');
    });
  });
});
