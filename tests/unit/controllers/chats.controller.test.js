const chatsController = require('../../../src/controllers/chats.controller');
const chatsService = require('../../../src/services/chats.service');
jest.mock('../../../src/services/chats.service');

describe('Chats Controller Tests', () => {
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

  describe('POST /create-chat', () => {
    it('should create a one-to-one chat successfully', async () => {
      const payload = { type: 'one-to-one', name: 'Chat with John' };
      const req = mockRequest(payload);
      const response = { chatId: 1 };

      chatsService.createSingle.mockResolvedValue(response);

      await chatsController.createChat(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User has been successfully created',
        response,
      });
    });

    it('should create a group chat successfully', async () => {
      const payload = { type: 'group', name: 'Group Chat' };
      const req = mockRequest(payload, {}, {}, { path: 'image-path.jpg' });
      const response = { chatId: 2 };

      chatsService.createGroup.mockResolvedValue(response);

      await chatsController.createChat(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'User has been successfully created',
        response,
      });
    });

    it('should handle error when creating chat fails', async () => {
      const payload = { type: 'one-to-one', name: 'Chat with John' };
      const req = mockRequest(payload);

      const error = new Error('Error creating chat');
      chatsService.createSingle.mockRejectedValue(error);

      await chatsController.createChat(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error creating chat',
      });
    });
  });

  describe('GET /get-chat/:chatId', () => {
    it('should fetch chat details successfully', async () => {
      const req = mockRequest({}, { chatId: '1' });
      const response = { chatId: 1, name: 'Chat with John' };

      chatsService.find.mockResolvedValue(response);

      await chatsController.getChat(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'successfully getting the chat',
        response,
      });
    });

    it('should handle error when fetching chat fails', async () => {
      const req = mockRequest({}, { chatId: '1' });

      const error = new Error('Chat not found');
      chatsService.find.mockRejectedValue(error);

      await chatsController.getChat(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Chat not found',
      });
    });
  });

  describe('PUT /edit-chat/:chatId', () => {
    it('should edit a group chat successfully', async () => {
      const payload = { name: 'Updated Group Chat' };
      const req = mockRequest(
        payload,
        { chatId: '1' },
        {},
        { path: 'image-path.jpg' },
      );

      chatsService.edit.mockResolvedValue(true);

      await chatsController.editChat(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(202);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'successfully edited the group chat',
      });
    });

    it('should handle error when editing chat fails', async () => {
      const payload = { name: 'Updated Group Chat' };
      const req = mockRequest(payload, { chatId: '1' });

      const error = new Error('Error editing chat');
      chatsService.edit.mockRejectedValue(error);

      await chatsController.editChat(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error editing chat',
      });
    });
  });

  describe('DELETE /delete-chat/:chatId', () => {
    it('should delete a chat successfully', async () => {
      const req = mockRequest({}, { chatId: '1' });

      chatsService.remove.mockResolvedValue(true);

      await chatsController.deleteChat(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(202);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'successfully deleted the group chat',
      });
    });

    it('should handle error when deleting chat fails', async () => {
      const req = mockRequest({}, { chatId: '1' });

      const error = new Error('Error deleting chat');
      chatsService.remove.mockRejectedValue(error);

      await chatsController.deleteChat(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error deleting chat',
      });
    });
  });

  describe('POST /add-user/:chatId', () => {
    it('should add a user to the chat successfully', async () => {
      const payload = { userId: 2 };
      const req = mockRequest(payload, { chatId: '1' });

      chatsService.addUser.mockResolvedValue(true);

      await chatsController.addUser(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'successfully added user in chat',
      });
    });

    it('should handle error when adding user fails', async () => {
      const payload = { userId: 2 };
      const req = mockRequest(payload, { chatId: '1' });

      const error = new Error('Error adding user');
      chatsService.addUser.mockRejectedValue(error);

      await chatsController.addUser(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error adding user',
      });
    });
  });

  describe('POST /email-invite/:chatId', () => {
    it('should send email invite successfully', async () => {
      const payload = { email: 'john@example.com' };
      const req = mockRequest(payload, { chatId: '1' });

      chatsService.invite.mockResolvedValue(true);

      await chatsController.emailInvite(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'successfully sent invite to the email',
      });
    });

    it('should handle error when sending invite fails', async () => {
      const payload = { email: 'john@example.com' };
      const req = mockRequest(payload, { chatId: '1' });

      const error = new Error('Error sending invite');
      chatsService.invite.mockRejectedValue(error);

      await chatsController.emailInvite(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error sending invite',
      });
    });
  });

  describe('DELETE /remove-user/:chatId/:userId', () => {
    it('should remove a user from the chat successfully', async () => {
      const req = mockRequest({}, { chatId: '1', userId: '2' });
      chatsService.removeUser.mockResolvedValue(true);

      await chatsController.removeUser(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(202);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'successfully removed the user',
      });
    });

    it('should handle error when removing user fails', async () => {
      const req = mockRequest({}, { chatId: '1', userId: '2' });

      const error = new Error('Error removing user');
      chatsService.removeUser.mockRejectedValue(error);

      await chatsController.removeUser(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error removing user',
      });
    });
  });

  describe('POST /create-message/:chatId', () => {
    it('should create a message successfully', async () => {
      const payload = { content: 'Hello, world!' };
      const req = mockRequest(
        payload,
        { chatId: '1' },
        {},
        { path: 'media.jpg' },
      );

      chatsService.createMessage.mockResolvedValue(true);

      await chatsController.createMessage(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'successfully added the message',
      });
    });

    it('should handle error when creating message fails', async () => {
      const payload = { content: 'Hello, world!' };
      const req = mockRequest(payload, { chatId: '1' });

      const error = new Error('Error creating message');
      chatsService.createMessage.mockRejectedValue(error);

      await chatsController.createMessage(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error creating message',
      });
    });
  });

  describe('PUT /edit-message/:chatId/:messageId', () => {
    it('should edit a message successfully', async () => {
      const payload = { content: 'Updated message' };
      const req = mockRequest(
        payload,
        { chatId: '1', messageId: '10' },
        {},
        { path: 'new-media.jpg' },
      );

      const response = { messageId: '10', content: 'Updated message' };
      chatsService.editMessage.mockResolvedValue(response);

      await chatsController.editMessage(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Message edited successfully',
        response,
      });
    });

    it('should handle error when editing message fails', async () => {
      const payload = { content: 'Updated message' };
      const req = mockRequest(payload, { chatId: '1', messageId: '10' });

      const error = new Error('Error editing message');
      chatsService.editMessage.mockRejectedValue(error);

      await chatsController.editMessage(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error editing message',
      });
    });
  });

  describe('DELETE /delete-message/:chatId/:messageId', () => {
    it('should delete a message successfully', async () => {
      const req = mockRequest({}, { chatId: '1', messageId: '10' });

      const response = 'Message deleted successfully';
      chatsService.deleteMessage.mockResolvedValue(response);

      await chatsController.deleteMessage(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: response,
      });
    });

    it('should handle error when deleting message fails', async () => {
      const req = mockRequest({}, { chatId: '1', messageId: '10' });

      const error = new Error('Error deleting message');
      chatsService.deleteMessage.mockRejectedValue(error);

      await chatsController.deleteMessage(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error deleting message',
      });
    });
  });

  describe('GET /display-messages/:chatId', () => {
    it('should display messages successfully', async () => {
      const req = mockRequest({}, { chatId: '1' }, { page: '1' });

      const response = [{ messageId: '10', content: 'Hello' }];
      chatsService.displayMessages.mockResolvedValue(response);

      await chatsController.displayMessages(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: response,
      });
    });

    it('should handle error when fetching messages fails', async () => {
      const req = mockRequest({}, { chatId: '1' });

      const error = new Error('Error fetching messages');
      chatsService.displayMessages.mockRejectedValue(error);

      await chatsController.displayMessages(req, mockResponse);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: 'Error fetching messages',
      });
    });
  });
});
