const authService = require('../../../src/services/auth.service');
const User = require('../../../src/models').User;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');
const { reddis } = require('../../../src/config/redis');
const { transporter } = require('../../../src/utils/email.util');
const { validUser } = require('../../../src/helpers/auth.helper');
const { addTokenToBlacklist } = require('../../../src/helpers/redis.helper');
const commonHelpers = require('../../../src/helpers/common.helper');
const { sequelize } = require('../../../src/models');

jest.mock('../../../src/models');
jest.mock('bcrypt');
jest.mock('otp-generator');
jest.mock('../../../src/config/redis');
jest.mock('../../../src/utils/email.util');
jest.mock('../../../src/helpers/auth.helper');
jest.mock('../../../src/helpers/redis.helper');
jest.mock('jsonwebtoken');
jest.mock('../../../src/helpers/common.helper');

describe('Auth Service Tests', () => {
  const mockEmail = 'test@example.com';
  const mockOtp = '123456';
  const mockUser = {
    id: 1,
    name: 'Test User',
    email: mockEmail,
    about: 'Test User Profile',
  };

  const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendOtp', () => {
    it('should send OTP successfully', async () => {
      const payload = { email: mockEmail };

      validUser.mockResolvedValue(true);
      otpGenerator.generate.mockReturnValue(mockOtp);
      reddis.set.mockResolvedValue(true);
      transporter.sendMail.mockImplementation((mailOptions, callback) => {
        callback(null, { response: 'Email sent' });
      });

      const result = await authService.sendOtp(payload);

      expect(result).toEqual({
        message: 'otp sent successfully',
        otp: mockOtp,
      });
      expect(reddis.set).toHaveBeenCalledWith(mockEmail, mockOtp, 'ex', 300);
      expect(transporter.sendMail).toHaveBeenCalled();
    });

    it('should throw error if user is not registered', async () => {
      const payload = { email: mockEmail };

      validUser.mockResolvedValue(false);

      await commonHelpers.customError('User is not registered', 404);
    });

    it('should handle email sending error', async () => {
      const payload = { email: mockEmail };

      validUser.mockResolvedValue(true);
      otpGenerator.generate.mockReturnValue(mockOtp);
      reddis.set.mockResolvedValue(true);

      transporter.sendMail.mockImplementation((mailOptions, callback) => {
        callback(new Error('Error sending mail'), null);
      });

      await commonHelpers.customError('Error sending mail', 400);
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP successfully and return a token', async () => {
      const payload = { email: mockEmail, otp: mockOtp };

      validUser.mockResolvedValue(true);
      User.findOne.mockResolvedValue(mockUser);
      reddis.get.mockResolvedValue(mockOtp);
      jwt.sign.mockReturnValue('mock-jwt-token');

      const result = await authService.verifyOtp(payload);

      expect(result).toBe('mock-jwt-token');
      expect(reddis.del).toHaveBeenCalledWith(mockEmail);
    });

    it('should throw error if OTP does not match', async () => {
      const payload = { email: mockEmail, otp: 'wrongOtp' };

      validUser.mockResolvedValue(true);
      User.findOne.mockResolvedValue(mockUser);
      reddis.get.mockResolvedValue('123456');

      await commonHelpers.customError('OTP did not match', 400);
    });

    it('should throw error if user is not registered', async () => {
      const payload = { email: mockEmail, otp: mockOtp };

      validUser.mockResolvedValue(false);

      await commonHelpers.customError('User is not registered', 404);
    });
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const payload = {
        name: 'Test User',
        email: mockEmail,
        about: 'Test User Profile',
      };

      const image = 'image-path.jpg';

      validUser.mockResolvedValue(false);

      sequelize.transaction.mockResolvedValue(mockTransaction);
      User.create.mockResolvedValue(mockUser);

      const result = await authService.create(payload, image);

      expect(result).toEqual(mockUser);
      expect(User.create).toHaveBeenCalledWith(
        {
          name: 'Test User',
          image: 'image-path.jpg',
          email: mockEmail,
          about: 'Test User Profile',
        },
        { transaction: mockTransaction },
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('should throw error if user already exists', async () => {
      const payload = {
        name: 'Test User',
        email: mockEmail,
        about: 'Test User Profile',
      };

      validUser.mockResolvedValue(true);

      await commonHelpers.customError('User already registered', 400);
    });
  });

  describe('remove', () => {
    it('should log out user successfully', async () => {
      const token = 'valid-jwt-token';

      jwt.decode.mockReturnValue({ id: 1 });
      addTokenToBlacklist.mockResolvedValue(true);

      const result = await authService.remove(token);

      expect(result).toEqual({ message: 'Logged out successfully' });
      expect(addTokenToBlacklist).toHaveBeenCalledWith(token, 3600);
    });

    it('should throw error if no token is provided', async () => {
      await commonHelpers.customError('Token is required for logout', 401);
    });

    it('should throw error if token is invalid', async () => {
      const token = 'invalid-jwt-token';

      jwt.decode.mockReturnValue(null);

      await commonHelpers.customError('Invalid token', 401);
    });
  });
});
