const { authMiddleware } = require('../../../src/middlewares/auth.middleware');
const { isTokenBlacklisted } = require('../../../src/helpers/redis.helper');
const { verifyToken } = require('../../../src/helpers/auth.helper');
const commonHelpers = require('../../../src/helpers/common.helper');

jest.mock('../../../src/helpers/redis.helper');
jest.mock('../../../src/helpers/auth.helper');
jest.mock('../../../src/helpers/common.helper');

describe('Auth Middleware Tests', () => {
  let mockRequest, mockResponse, next;

  beforeEach(() => {
    mockRequest = (headers = {}) => ({
      headers: {
        authorization: headers['authorization'] || '',
      },
    });

    mockResponse = () => {
      const res = {};
      res.status = jest.fn().mockReturnThis();
      res.json = jest.fn();
      return res;
    };

    next = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('When Token is Missing', () => {
    it('should return 401 if token is missing', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('When Token is Blacklisted', () => {
    it('should return 401 if token is blacklisted', async () => {
      const token = 'blacklisted-token';
      const req = mockRequest({ authorization: token });
      const res = mockResponse();

      isTokenBlacklisted.mockResolvedValue(true);

      await authMiddleware(req, res, next);

      expect(isTokenBlacklisted).toHaveBeenCalledWith(token);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('When Token is Invalid or Expired', () => {
    it('should return 401 if token is invalid', async () => {
      const token = 'invalid-token';
      const req = mockRequest({ authorization: token });
      const res = mockResponse();

      isTokenBlacklisted.mockResolvedValue(false);
      verifyToken.mockRejectedValue(new Error('Invalid or expired token'));

      await authMiddleware(req, res, next);

      expect(verifyToken).toHaveBeenCalledWith(token);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('When Token is Valid', () => {
    it('should call next() and attach the user to req.user if token is valid', async () => {
      const token = 'valid-jwt-token';
      const decodedUser = { id: 1, email: 'user@example.com' };
      const req = mockRequest({ authorization: token });
      const res = mockResponse();

      isTokenBlacklisted.mockResolvedValue(false);
      verifyToken.mockResolvedValue(decodedUser);

      await authMiddleware(req, res, next);

      expect(verifyToken).toHaveBeenCalledWith(token);
      expect(req.user).toEqual(decodedUser);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });
});
