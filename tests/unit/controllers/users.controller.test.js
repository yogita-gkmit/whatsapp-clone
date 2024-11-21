const usersController = require('../../../src/controllers/users.controller');
const usersService = require('../../../src/services/users.service');
jest.mock('../../../src/services/users.service');

describe('Users Controller Tests', () => {
  const mockResponse = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

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
    it('should get users list successfully', async () => {
      const req = mockRequest({}, {}, { page: '1' });

      const response = { users: [{ id: 1, name: 'John Doe' }] };
      usersService.users.mockResolvedValue(response);

      await usersController.users(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: response,
      });
    });

    it('should handle error when getting users fails', async () => {
      const req = mockRequest({}, {}, { page: '1' });

      const error = new Error('Error getting users');
      usersService.users.mockRejectedValue(error);

      await usersController.users(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error getting users',
      });
    });
  });

  describe('GET /my-profile', () => {
    it('should get the logged-in user profile successfully', async () => {
      const req = mockRequest();

      const response = { id: 1, name: 'John Doe' };
      usersService.profile.mockResolvedValue(response);

      await usersController.myProfile(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: response,
      });
    });

    it('should handle error when getting profile fails', async () => {
      const req = mockRequest();

      const error = new Error('Error getting profile');
      usersService.profile.mockRejectedValue(error);

      await usersController.myProfile(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error getting profile',
      });
    });
  });

  describe('GET /specific-profile/:id', () => {
    it('should get a specific user profile successfully', async () => {
      const req = mockRequest({}, { id: '2' });

      const response = { id: 2, name: 'Jane Doe' };
      usersService.profile.mockResolvedValue(response);

      await usersController.specificProfile(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: response,
      });
    });

    it('should handle error when getting specific profile fails', async () => {
      const req = mockRequest({}, { id: '2' });

      const error = new Error('Error getting specific profile');
      usersService.profile.mockRejectedValue(error);

      await usersController.specificProfile(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error getting specific profile',
      });
    });
  });

  describe('PUT /edit-my-profile', () => {
    it('should edit the logged-in user profile successfully', async () => {
      const req = mockRequest(
        { name: 'John Updated' },
        {},
        {},
        { path: 'new-image.jpg' },
      );

      const response = { id: 1, name: 'John Updated' };
      usersService.editProfile.mockResolvedValue(response);

      await usersController.editMyProfile(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: response,
      });
    });

    it('should handle error when editing profile fails', async () => {
      const req = mockRequest({ name: 'John Updated' });

      const error = new Error('Error editing profile');
      usersService.editProfile.mockRejectedValue(error);

      await usersController.editMyProfile(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error editing profile',
      });
    });
  });

  describe('PUT /edit-specific-profile/:id', () => {
    it('should edit a specific user profile successfully', async () => {
      const req = mockRequest(
        { name: 'Jane Updated' },
        { id: '2' },
        {},
        { path: 'updated-image.jpg' },
      );

      const response = { id: 2, name: 'Jane Updated' };
      usersService.editProfile.mockResolvedValue(response);

      await usersController.editSpecificProfile(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: response,
      });
    });

    it('should handle error when editing specific profile fails', async () => {
      const req = mockRequest({ name: 'Jane Updated' }, { id: '2' });

      const error = new Error('Error editing specific profile');
      usersService.editProfile.mockRejectedValue(error);

      await usersController.editSpecificProfile(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error editing specific profile',
      });
    });
  });

  describe('GET /inbox/:id', () => {
    it('should get the inbox messages for the user successfully', async () => {
      const req = mockRequest({}, { id: '2' }, { page: '1' });

      const response = [{ messageId: '1', content: 'Message 1' }];
      usersService.inbox.mockResolvedValue(response);

      await usersController.inbox(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: response,
      });
    });

    it('should handle error when getting inbox fails', async () => {
      const req = mockRequest({}, { id: '2' }, { page: '1' });

      const error = new Error('Error getting inbox');
      usersService.inbox.mockRejectedValue(error);

      await usersController.inbox(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error getting inbox',
      });
    });
  });
});
