const Joi = require('joi');
const {
  chatIdParamSchema,
  messageIdParamSchema,
  userIdParamSchema,
  createChatBodySchema,
  editChatBodySchema,
  // editRoleSchema,
  addUserBodySchema,
  emailInviteBodySchema,
  createMessageBodySchema,
  editMessageBodySchema,
  removeUserBodySchema,
} = require('../../../src/validators/chats.validator');

describe('Validation Schemas Tests', () => {
  describe('chatIdParamSchema', () => {
    it('should pass when valid chatId is provided', () => {
      const validData = { chatId: 'c1e4c3fc-4f8d-45f2-bf7b-c56f3aaf70f5' };
      const { error } = chatIdParamSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should fail when chatId is missing', () => {
      const invalidData = {};
      const { error } = chatIdParamSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"chatId" is required');
    });

    it('should fail when chatId is invalid UUID', () => {
      const invalidData = { chatId: 'invalid-chat-id' };
      const { error } = chatIdParamSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"chatId" must be a valid GUID');
    });
  });

  describe('messageIdParamSchema', () => {
    it('should pass when valid messageId and chatId are provided', () => {
      const validData = {
        messageId: 'c1e4c3fc-4f8d-45f2-bf7b-c56f3aaf70f5',
        chatId: 'b1e4c3fc-4f8d-45f2-bf7b-c56f3aaf70f5',
      };
      const { error } = messageIdParamSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should fail when messageId or chatId are missing', () => {
      const invalidData = { messageId: 'c1e4c3fc-4f8d-45f2-bf7b-c56f3aaf70f5' };
      const { error } = messageIdParamSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"chatId" is required');
    });

    it('should fail when messageId or chatId are invalid UUIDs', () => {
      const invalidData = {
        messageId: 'invalid-message-id',
        chatId: 'invalid-chat-id',
      };
      const { error } = messageIdParamSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"messageId" must be a valid GUID');
    });
  });

  describe('userIdParamSchema', () => {
    it('should pass when valid userId and chatId are provided', () => {
      const validData = {
        userId: 'c1e4c3fc-4f8d-45f2-bf7b-c56f3aaf70f5',
        chatId: 'b1e4c3fc-4f8d-45f2-bf7b-c56f3aaf70f5',
      };
      const { error } = userIdParamSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should fail when userId or chatId are missing', () => {
      const invalidData = { userId: 'c1e4c3fc-4f8d-45f2-bf7b-c56f3aaf70f5' };
      const { error } = userIdParamSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"chatId" is required');
    });

    it('should fail when userId or chatId are invalid UUIDs', () => {
      const invalidData = {
        userId: 'invalid-user-id',
        chatId: 'invalid-chat-id',
      };
      const { error } = userIdParamSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toEqual('"userId" must be a valid GUID');
    });
  });

  describe('createChatBodySchema', () => {
    it('should pass when valid data is provided for one-to-one chat', () => {
      const validData = {
        type: 'one-to-one',
        user_ids: ['c1e4c3fc-4f8d-45f2-bf7b-c56f3aaf70f5'],
      };
      const { error } = createChatBodySchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should fail when "user_ids" for one-to-one chat are not exactly 1', () => {
      const invalidData = {
        type: 'one-to-one',
        user_ids: [
          'c1e4c3fc-4f8d-45f2-bf7b-c56f3aaf70f5',
          'b1e4c3fc-4f8d-45f2-bf7b-c56f3aaf70f5',
        ],
      };
      const { error } = createChatBodySchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"user_ids" must contain 1 items');
    });

    it('should fail when "name" is missing for a group chat', () => {
      const invalidData = {
        type: 'group',
        user_ids: ['c1e4c3fc-4f8d-45f2-bf7b-c56f3aaf70f5'],
      };
      const { error } = createChatBodySchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"name" is required');
    });

    it('should pass when valid data is provided for a group chat', () => {
      const validData = {
        type: 'group',
        user_ids: [
          'c1e4c3fc-4f8d-45f2-bf7b-c56f3aaf70f5',
          'd2e4c3fc-4f8d-45f2-bf7b-c56f3aaf70f5',
        ],
        name: 'My Group Chat',
        description: 'Description of the group chat',
      };
      const { error } = createChatBodySchema.validate(validData);
      expect(error).toBeUndefined();
    });
  });

  describe('editChatBodySchema', () => {
    it('should pass when valid data is provided for editing', () => {
      const validData = {
        name: 'New Chat Name',
        description: 'New Description',
      };
      const { error } = editChatBodySchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should fail when name is shorter than 3 characters', () => {
      const invalidData = { name: 'ab', description: 'New Description' };
      const { error } = editChatBodySchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe(
        '"name" length must be at least 3 characters long',
      );
    });
  });

  describe('addUserBodySchema', () => {
    it('should pass when valid token is provided', () => {
      const validData = { token: 'valid-token' };
      const { error } = addUserBodySchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should fail when token is missing', () => {
      const invalidData = {};
      const { error } = addUserBodySchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"token" is required');
    });
  });

  describe('emailInviteBodySchema', () => {
    it('should pass when valid user_id is provided', () => {
      const validData = { user_id: 'c1e4c3fc-4f8d-45f2-bf7b-c56f3aaf70f5' };
      const { error } = emailInviteBodySchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should fail when user_id is missing', () => {
      const invalidData = {};
      const { error } = emailInviteBodySchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"user_id" is required');
    });
  });

  describe('createMessageBodySchema', () => {
    it('should pass when valid message is provided', () => {
      const validData = { message: 'Hello', media: 'http://example.com/media' };
      const { error } = createMessageBodySchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should fail when message is more than 1000 characters', () => {
      const invalidData = { message: 'a'.repeat(1001) };
      const { error } = createMessageBodySchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe(
        '"message" length must be less than or equal to 1000 characters long',
      );
    });
  });

  describe('editMessageBodySchema', () => {
    it('should pass when valid data is provided', () => {
      const validData = {
        message: 'Updated message',
        media: 'http://example.com/media',
      };
      const { error } = editMessageBodySchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should fail when message is missing', () => {
      const invalidData = { media: 'http://example.com/media' };
      const { error } = editMessageBodySchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"message" is required');
    });
  });

  describe('removeUserBodySchema', () => {
    it('should pass when valid token is provided', () => {
      const validData = { token: 'valid-token' };
      const { error } = removeUserBodySchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should fail when token is missing', () => {
      const invalidData = {};
      const { error } = removeUserBodySchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"token" is required');
    });
  });
});
