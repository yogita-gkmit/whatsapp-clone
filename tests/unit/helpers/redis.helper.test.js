const {
  isTokenBlacklisted,
  addTokenToBlacklist,
} = require('../../../src/helpers/redis.helper');
const { reddis } = require('../../../src/config/redis');

jest.mock('../../../src/config/redis', () => ({
  reddis: {
    set: jest.fn(),
    get: jest.fn(),
  },
}));

describe('Auth Service Tests - Token Blacklist', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addTokenToBlacklist function', () => {
    it('should add the token to the blacklist with the correct expiration time', async () => {
      const token = 'valid-jwt-token';
      const expiresIn = 3600;

      reddis.set.mockResolvedValue('OK');

      const result = await addTokenToBlacklist(token, expiresIn);

      expect(reddis.set).toHaveBeenCalledWith(
        token,
        'blacklisted',
        'EX',
        expiresIn,
      );
      expect(result).toBe('Token added to blacklist');
    });

    it('should throw an error if adding the token to the blacklist fails', async () => {
      const token = 'invalid-jwt-token';
      const expiresIn = 3600;

      reddis.set.mockRejectedValue(new Error('Redis error'));

      try {
        await addTokenToBlacklist(token, expiresIn);
      } catch (err) {
        expect(err.message).toBe('Redis error');
      }
    });
  });

  describe('isTokenBlacklisted function', () => {
    it('should return true if the token is blacklisted', async () => {
      const token = 'valid-jwt-token';

      reddis.get.mockResolvedValue('blacklisted');

      const result = await isTokenBlacklisted(token);

      expect(result).toBe(true);
      expect(reddis.get).toHaveBeenCalledWith(token);
    });

    it('should return false if the token is not blacklisted', async () => {
      const token = 'non-blacklisted-token';

      reddis.get.mockResolvedValue(null);

      const result = await isTokenBlacklisted(token);

      expect(result).toBe(false);
      expect(reddis.get).toHaveBeenCalledWith(token);
    });

    it('should throw an error if checking blacklist status fails', async () => {
      const token = 'invalid-token';

      reddis.get.mockRejectedValue(new Error('Redis error'));

      try {
        await isTokenBlacklisted(token);
      } catch (err) {
        expect(err.message).toBe('Redis error');
      }
    });
  });
});
