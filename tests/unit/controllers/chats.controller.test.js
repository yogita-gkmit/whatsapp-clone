const chatsController = require('../../../src/controllers/chats.controller');
const chatsService = require('../../../src/services/chats.service');

jest.mock('../../../src/services/chats.service');

describe('Chat Controller Tests', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      body: {},
      file: null,
      params: {},
      query: {},
      user: { id: 'user-id' },
    };

    res = {
      statusCode: null,
      data: null,
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();
  });

  describe('createChat', () => {
    it('should create a one-to-one chat successfully', async () => {
      req.body = { type: 'one-to-one', otherData: 'test' };
      const mockResponse = { id: 'chat-id' };
      chatsService.create.mockResolvedValue(mockResponse);

      await chatsController.createChat(req, res, next);

      expect(chatsService.create).toHaveBeenCalled();
      expect(res.statusCode).toBe(201);
      expect(res.data).toEqual(mockResponse);
      expect(next).toHaveBeenCalled();
    });

    it('should create a group chat successfully', async () => {
      req.body = { type: 'group', otherData: 'test' };
      req.file = { path: 'image-path' };
      const mockResponse = { id: 'group-id' };
      chatsService.create.mockResolvedValue(mockResponse);

      await chatsController.createChat(req, res, next);

      expect(chatsService.create).toHaveBeenCalledWith(
        req.body,
        'image-path',
        req.user.id,
      );
      expect(res.statusCode).toBe(201);
      expect(res.data).toEqual(mockResponse);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors during chat creation', async () => {
      req.body = { type: 'group' };
      const mockError = new Error('Chat creation failed');
      chatsService.create.mockRejectedValue(mockError);

      await chatsController.createChat(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: mockError.message });
    });
  });

  describe('getChat', () => {
    it('should fetch a chat successfully', async () => {
      req.params.id = 'chat-id';
      const mockResponse = { id: 'chat-id', data: 'chat-data' };
      chatsService.find.mockResolvedValue(mockResponse);

      await chatsController.getChat(req, res, next);

      expect(chatsService.find).toHaveBeenCalledWith('chat-id', req.user.id);
      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual(mockResponse);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors during chat retrieval', async () => {
      req.params.id = 'chat-id';
      const mockError = new Error('Chat not found');
      chatsService.find.mockRejectedValue(mockError);

      await chatsController.getChat(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: mockError.message });
    });
  });

  describe('editChat', () => {
    it('should edit a chat successfully', async () => {
      req.params.id = 'chat-id';
      req.body = { name: 'New Chat Name' };
      const mockResponse = { id: 'chat-id', name: 'New Chat Name' };
      chatsService.edit.mockResolvedValue(mockResponse);

      await chatsController.editChat(req, res, next);

      expect(chatsService.edit).toHaveBeenCalledWith(
        'chat-id',
        req.user.id,
        req.body,
        undefined,
      );
      expect(res.statusCode).toBe(202);
      expect(res.data).toEqual(mockResponse);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors during chat editing', async () => {
      req.params.id = 'chat-id';
      const mockError = new Error('Chat edit failed');
      chatsService.edit.mockRejectedValue(mockError);

      await chatsController.editChat(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: mockError.message });
    });
  });

  describe('deleteChat', () => {
    it('should delete a chat successfully', async () => {
      req.params.id = 'chat-id';
      const mockResponse = { message: 'Chat deleted' };
      chatsService.remove.mockResolvedValue(mockResponse);

      await chatsController.deleteChat(req, res, next);

      expect(chatsService.remove).toHaveBeenCalledWith('chat-id', req.user.id);
      expect(res.statusCode).toBe(202);
      expect(res.data).toEqual({
        message: 'successfully deleted the group chat',
        response: mockResponse,
      });
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors during chat deletion', async () => {
      req.params.id = 'chat-id';
      const mockError = new Error('Chat deletion failed');
      chatsService.remove.mockRejectedValue(mockError);

      await chatsController.deleteChat(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: mockError.message });
    });
  });

  describe('addUser', () => {
    it('should add a user to a chat successfully', async () => {
      req.params.id = 'chat-id';
      req.query.token = 'some-token';
      req.user.id = 'user-id';

      const mockResponse = { id: 'new-user-id', added: true };
      chatsService.addUser.mockResolvedValue(mockResponse);

      const result = await chatsController.addUser(req, res, next);
      console.log(result);

      expect(chatsService.addUser).toHaveBeenCalledWith(
        'chat-id',
        'user-id',
        'some-token',
      );
      expect(res.statusCode).toBe(201);
      expect(res.data).toEqual(mockResponse);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors during adding user', async () => {
      req.params.id = 'chat-id';
      const mockError = new Error('Failed to add user');
      chatsService.addUser.mockRejectedValue(mockError);

      await chatsController.addUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: mockError.message });
    });
  });

  describe('editAdmin', () => {
    it('should edit admin successfully', async () => {
      req.params.id = 'chat-id';
      req.body = { userId: 'admin-id' };
      const mockResponse = { id: 'chat-id', admin: 'admin-id' };
      chatsService.editrole.mockResolvedValue(mockResponse);

      await chatsController.editAdmin(req, res, next);

      expect(chatsService.editrole).toHaveBeenCalledWith(
        'chat-id',
        req.user.id,
        req.body,
      );
      expect(res.statusCode).toBe(202);
      expect(res.data).toEqual(mockResponse);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors during editing admin', async () => {
      const mockError = new Error('Failed to edit admin');
      chatsService.editrole.mockRejectedValue(mockError);

      await chatsController.editAdmin(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: mockError.message });
    });
  });

  describe('emailInvite', () => {
    it('should send an email invite successfully', async () => {
      req.params.id = 'chat-id';
      req.body = { email: 'invitee@example.com' };
      const mockResponse = { success: true };
      chatsService.invite.mockResolvedValue(mockResponse);

      await chatsController.emailInvite(req, res, next);

      expect(chatsService.invite).toHaveBeenCalledWith(
        'chat-id',
        req.user.id,
        req.body,
      );
      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual(mockResponse);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors during email invite', async () => {
      const mockError = new Error('Failed to send email invite');
      chatsService.invite.mockRejectedValue(mockError);

      await chatsController.emailInvite(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: mockError.message });
    });
  });

  describe('removeUser', () => {
    it('should remove a user from the chat successfully', async () => {
      req.params = { id: 'chat-id', userId: 'user-id' };
      const mockResponse = { success: true };
      chatsService.removeUser.mockResolvedValue(mockResponse);

      await chatsController.removeUser(req, res, next);

      expect(chatsService.removeUser).toHaveBeenCalledWith(
        req.user.id,
        'chat-id',
        'user-id',
      );
      expect(res.statusCode).toBe(202);
      expect(res.data).toEqual({
        message: 'successfully removed the user',
        response: mockResponse,
      });
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors during user removal', async () => {
      const mockError = new Error('Failed to remove user');
      chatsService.removeUser.mockRejectedValue(mockError);

      await chatsController.removeUser(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: mockError.message });
    });
  });

  describe('createMessage', () => {
    it('should create a message successfully', async () => {
      req.params.id = 'chat-id';
      req.body = { content: 'Hello!' };
      req.file = { path: 'media-path' };
      const mockResponse = { id: 'message-id', content: 'Hello!' };
      chatsService.createMessage.mockResolvedValue(mockResponse);

      await chatsController.createMessage(req, res, next);

      expect(chatsService.createMessage).toHaveBeenCalledWith(
        'chat-id',
        req.user.id,
        req.body,
        'media-path',
      );
      expect(res.statusCode).toBe(202);
      expect(res.data).toEqual({
        message: 'successfully added the message',
        response: mockResponse,
      });
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors during message creation', async () => {
      const mockError = new Error('Failed to create message');
      chatsService.createMessage.mockRejectedValue(mockError);

      await chatsController.createMessage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: mockError.message });
    });
  });

  describe('editMessage', () => {
    it('should edit a message successfully', async () => {
      req.params = { id: 'chat-id', messageId: 'message-id' };
      req.body = { content: 'Updated message' };
      req.file = { path: 'media-path' };
      const mockResponse = [{ id: 'message-id', content: 'Updated message' }];
      chatsService.editMessage.mockResolvedValue(mockResponse);

      await chatsController.editMessage(req, res, next);

      expect(chatsService.editMessage).toHaveBeenCalledWith(
        'chat-id',
        'message-id',
        req.user.id,
        req.body,
      );
      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual({
        message: 'Message edited successfully',
        response: mockResponse[0],
      });
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors during message editing', async () => {
      const mockError = new Error('Failed to edit message');
      chatsService.editMessage.mockRejectedValue(mockError);

      await chatsController.editMessage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: mockError.message });
    });
  });

  describe('deleteMessage', () => {
    it('should delete a message successfully', async () => {
      req.params = { id: 'chat-id', messageId: 'message-id' };
      const mockResponse = { success: true };
      chatsService.deleteMessage.mockResolvedValue(mockResponse);

      await chatsController.deleteMessage(req, res, next);

      expect(chatsService.deleteMessage).toHaveBeenCalledWith(
        'chat-id',
        'message-id',
        req.user.id,
      );
      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual(mockResponse);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors during message deletion', async () => {
      const mockError = new Error('Failed to delete message');
      chatsService.deleteMessage.mockRejectedValue(mockError);

      await chatsController.deleteMessage(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: mockError.message });
    });
  });

  describe('displayMessages', () => {
    it('should display messages successfully', async () => {
      req.params.id = 'chat-id';
      req.query = { page: 1, filter: 'all' };
      const mockResponse = [{ id: 'message-1', content: 'Hello' }];
      chatsService.displayMessages.mockResolvedValue(mockResponse);

      await chatsController.displayMessages(req, res, next);

      expect(chatsService.displayMessages).toHaveBeenCalledWith(
        'chat-id',
        req.user.id,
        1,
        'all',
      );
      expect(res.statusCode).toBe(200);
      expect(res.data).toEqual(mockResponse);
      expect(next).toHaveBeenCalled();
    });

    it('should handle errors during message display', async () => {
      const mockError = new Error('Failed to display messages');
      chatsService.displayMessages.mockRejectedValue(mockError);

      await chatsController.displayMessages(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: mockError.message });
    });
  });
});
