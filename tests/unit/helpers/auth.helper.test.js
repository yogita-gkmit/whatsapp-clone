const { validUser, verifyToken } = require('../../../src/helpers/auth.helper');
const User = require('../../../src/models').User;
const jwt = require('jsonwebtoken');

jest.mock('../../../src/models', () => ({
  User: {
    findOne: jest.fn(),
  },
}));

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

describe('Auth Service Tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validUser function', () => {
    it('should return true if user exists', async () => {
      const email = 'johndoe@example.com';
      const mockUser = { id: 1, email: 'johndoe@example.com' };

      User.findOne.mockResolvedValue(mockUser);

      const result = await validUser(email);

      expect(result).toBe(true);
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: email } });
    });

    it('should return false if user does not exist', async () => {
      const email = 'nonexistent@example.com';

      User.findOne.mockResolvedValue(null);

      const result = await validUser(email);

      expect(result).toBe(false);
      expect(User.findOne).toHaveBeenCalledWith({ where: { email: email } });
    });
  });

  describe('verifyToken function', () => {
    it('should resolve with decoded data when token is valid', async () => {
      const token = 'valid-jwt-token';
      const decoded = { id: 1, email: 'johndoe@example.com' };

      jwt.verify.mockImplementation((token, secret, callback) =>
        callback(null, decoded),
      );

      const result = await verifyToken(token);

      expect(result).toEqual(decoded);
      expect(jwt.verify).toHaveBeenCalledWith(
        token,
        process.env.JWT_SECRET,
        expect.any(Function),
      );
    });

    it('should reject with error when token is invalid', async () => {
      const token = 'invalid-jwt-token';
      const error = new Error('Invalid or expired token');

      jwt.verify.mockImplementation((token, secret, callback) =>
        callback(error, null),
      );

      try {
        await verifyToken(token);
      } catch (err) {
        expect(err).toEqual(new Error('Invalid or expired token'));
        expect(jwt.verify).toHaveBeenCalledWith(
          token,
          process.env.JWT_SECRET,
          expect.any(Function),
        );
      }
    });

    it('should reject with error when token is expired', async () => {
      const token = 'expired-jwt-token';
      const error = new Error('jwt expired');

      jwt.verify.mockImplementation((token, secret, callback) =>
        callback(error, null),
      );

      try {
        await verifyToken(token);
      } catch (err) {
        expect(err).toEqual(new Error('Invalid or expired token'));
        expect(jwt.verify).toHaveBeenCalledWith(
          token,
          process.env.JWT_SECRET,
          expect.any(Function),
        );
      }
    });
  });
});
