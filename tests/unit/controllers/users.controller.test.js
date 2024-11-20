const usersController = require('../../../src/controllers/users.controller');
const usersService = require('../../../src/services/users.service');
jest.mock('../../../src/services/users.service');

describe('Users Controller Tests', () => {
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  const mockNext = jest.fn();

  const mockRequest = (
    body = {},
    params = {},
    query = {},
    file = null,
    user = { id: 1 },
  ) => ({
    body,
    params,
    query,
    file,
    user,
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /users', () => {
    it('should fetch user list successfully and call next()', async () => {
      const req = mockRequest({}, {}, { page: '1' });
      const response = { users: [{ id: 1, name: 'John Doe' }] };
      usersService.users.mockResolvedValue(response);

      await usersController.users(req, mockResponse, mockNext);

      expect(usersService.users).toHaveBeenCalledWith(1, '1');
      expect(mockResponse.statusCode).toBe(200);
      expect(mockResponse.data).toEqual(response);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle error when fetching user list fails', async () => {
      const req = mockRequest({}, {}, { page: '1' });
      const error = new Error('Error fetching users');
      usersService.users.mockRejectedValue(error);

      await usersController.users(req, mockResponse, mockNext);

      expect(usersService.users).toHaveBeenCalledWith(1, '1');
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: error.message,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('GET /my-profile', () => {
    it('should fetch logged-in user profile successfully and call next()', async () => {
      const req = mockRequest();
      const response = { id: 1, name: 'John Doe' };
      usersService.profile.mockResolvedValue(response);

      await usersController.myProfile(req, mockResponse, mockNext);

      expect(usersService.profile).toHaveBeenCalledWith(1);
      expect(mockResponse.statusCode).toBe(200);
      expect(mockResponse.data).toEqual(response);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle error when fetching profile fails', async () => {
      const req = mockRequest();
      const error = new Error('Error fetching profile');
      usersService.profile.mockRejectedValue(error);

      await usersController.myProfile(req, mockResponse, mockNext);

      expect(usersService.profile).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: error.message,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('GET /specific-profile/:id', () => {
    it('should fetch a specific user profile successfully and call next()', async () => {
      const req = mockRequest({}, { id: '2' });
      const response = { id: 2, name: 'Jane Doe' };
      usersService.profile.mockResolvedValue(response);

      await usersController.specificProfile(req, mockResponse, mockNext);

      expect(usersService.profile).toHaveBeenCalledWith('2');
      expect(mockResponse.statusCode).toBe(200);
      expect(mockResponse.data).toEqual(response);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle error when fetching specific profile fails', async () => {
      const req = mockRequest({}, { id: '2' });
      const error = new Error('Error fetching profile');
      usersService.profile.mockRejectedValue(error);

      await usersController.specificProfile(req, mockResponse, mockNext);

      expect(usersService.profile).toHaveBeenCalledWith('2');
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: error.message,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('PUT /edit-my-profile', () => {
    it('should edit the logged-in user profile successfully and call next()', async () => {
      const req = mockRequest(
        { name: 'John Updated' },
        {},
        {},
        { path: 'new-image.jpg' },
      );
      const response = { id: 1, name: 'John Updated' };
      usersService.editProfile.mockResolvedValue(response);

      await usersController.editMyProfile(req, mockResponse, mockNext);

      expect(usersService.editProfile).toHaveBeenCalledWith(
        1,
        'new-image.jpg',
        req.body,
      );
      expect(mockResponse.statusCode).toBe(200);
      expect(mockResponse.data).toEqual(response);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle error when editing profile fails', async () => {
      const req = mockRequest({ name: 'John Updated' }, {}, {}, undefined);

      const error = new Error('Error editing profile');
      usersService.editProfile.mockRejectedValue(error);

      await usersController.editMyProfile(req, mockResponse, mockNext);

      expect(usersService.editProfile).toHaveBeenCalledWith(
        1,
        undefined,
        req.body,
      );
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: error.message,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('GET /inbox/:id', () => {
    it('should fetch inbox messages successfully and call next()', async () => {
      const req = mockRequest({}, { id: '2' }, { page: '1' });
      const response = [{ messageId: '1', content: 'Message 1' }];
      usersService.inbox.mockResolvedValue(response);

      await usersController.inbox(req, mockResponse, mockNext);

      expect(usersService.inbox).toHaveBeenCalledWith('2', 1, '1');
      expect(mockResponse.statusCode).toBe(200);
      expect(mockResponse.data).toEqual(response);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle error when fetching inbox fails', async () => {
      const req = mockRequest({}, { id: '2' }, { page: '1' });
      const error = new Error('Error fetching inbox');
      usersService.inbox.mockRejectedValue(error);

      await usersController.inbox(req, mockResponse, mockNext);

      expect(usersService.inbox).toHaveBeenCalledWith('2', 1, '1');
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: error.message,
      });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
});
