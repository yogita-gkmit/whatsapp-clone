const authController = require('../../../src/controllers/auth.controller');
const authServices = require('../../../src/services/auth.service');
jest.mock('../../../src/services/auth.service');

describe('Auth Controller Tests', () => {
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  const mockRequest = (body = {}, params = {}, query = {}, file = null) => ({
    body,
    params,
    query,
    file,
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    it('should register a user successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password123',
        phone: '1234567890',
        roles: ['user'],
      };

      const image = 'image-path.jpg';
      const req = mockRequest(userData, {}, {}, { path: image });

      authServices.create.mockResolvedValue(true);

      await authController.register(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User has been successfully created',
      });
    });

    it('should handle error when registration fails', async () => {
      const userData = {
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'password123',
        phone: '1234567890',
        roles: ['user'],
      };

      const req = mockRequest(userData);

      const error = new Error('Registration failed');
      authServices.create.mockRejectedValue(error);

      await authController.register(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Registration failed',
      });
    });
  });
  describe('POST /send-otp', () => {
    it('should send OTP successfully', async () => {
      const payload = { email: 'johndoe@example.com' };

      const req = mockRequest(payload);

      authServices.sendOtp.mockResolvedValue({
        success: true,
        message: 'otp sent successfully',
      });

      await authController.sendOtp(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: { message: 'otp sent successfully', success: true },
        success: true,
      });
    });

    it('should handle error when sending OTP fails', async () => {
      const payload = { email: 'johndoe@example.com' };
      const req = mockRequest(payload);

      const error = new Error('Failed to send OTP');
      authServices.sendOtp.mockRejectedValue(error);

      await authController.sendOtp(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Failed to send OTP',
      });
    });
  });

  describe('POST /verify-otp', () => {
    it('should verify OTP successfully', async () => {
      const payload = { email: 'johndoe@example.com', otp: '123456' };

      const req = mockRequest(payload);

      const token = 'valid-jwt-token';
      authServices.verifyOtp.mockResolvedValue(token);

      await authController.verifyOtp(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ token: token });
    });

    it('should handle error for invalid OTP', async () => {
      const payload = { email: 'johndoe@example.com', otp: 'invalid' };

      const req = mockRequest(payload);

      const error = new Error('Invalid OTP');
      authServices.verifyOtp.mockRejectedValue(error);

      await authController.verifyOtp(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Invalid OTP',
      });
    });
  });

  describe('POST /logout', () => {
    it('should logout successfully', async () => {
      const token = 'valid-jwt-token';
      const req = mockRequest({}, {}, {});
      req.headers = { authorization: `${token}` };

      authServices.remove.mockResolvedValue({
        message: 'Logged out successfully',
      });

      await authController.logout(req, mockResponse);

      expect(authServices.remove).toHaveBeenCalledWith(token);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Logged out successfully',
      });
    });

    it('should handle error for missing token in logout', async () => {
      let token;
      const req = mockRequest({}, {}, {});
      req.headers = { authorization: `${token}` };

      const err = new Error('Unauthorized');
      err.statusCode = 401;

      authServices.remove.mockRejectedValue(err);

      await authController.logout(req, mockResponse);

      expect(authServices.remove).toHaveBeenCalled();

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Unauthorized',
      });
    });

    it('should handle error for invalid token during logout', async () => {
      const token = 'invalid-jwt-token';
      const req = mockRequest({}, {}, {});
      req.headers = { authorization: `${token}` };

      const err = new Error('Unauthorized');
      err.statusCode = 401;

      authServices.remove.mockRejectedValue(err);

      await authController.logout(req, mockResponse);

      expect(authServices.remove).toHaveBeenCalledWith(token);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Unauthorized',
      });
    });
  });
});
