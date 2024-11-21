const Joi = require('joi');
const {
  editProfileSchema,
  queryPageSchema,
  idParamSchema,
} = require('../../../src/validators/users.validator');

describe('Validation Schemas Tests', () => {
  describe('editProfileSchema', () => {
    it('should pass when valid data is provided', () => {
      const validData = {
        name: 'John Doe',
        about: 'A short bio',
        email: 'johndoe@example.com',
      };
      const { error } = editProfileSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should fail when name is missing', () => {
      const invalidData = {
        about: 'A short bio',
        email: 'johndoe@example.com',
      };
      const { error } = editProfileSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"name" is required');
    });

    it('should fail when about is missing', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'johndoe@example.com',
      };
      const { error } = editProfileSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"about" is required');
    });

    it('should fail when email is missing', () => {
      const invalidData = {
        name: 'John Doe',
        about: 'A short bio',
      };
      const { error } = editProfileSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"email" is required');
    });

    it('should fail when email is invalid', () => {
      const invalidData = {
        name: 'John Doe',
        about: 'A short bio',
        email: 'invalid-email',
      };
      const { error } = editProfileSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"email" must be a valid email');
    });
  });

  describe('queryPageSchema', () => {
    it('should pass when valid page number is provided', () => {
      const validData = { page: 2 };
      const { error } = queryPageSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should pass when page is not provided (optional)', () => {
      const validData = {};
      const { error } = queryPageSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should fail when page is not an integer', () => {
      const invalidData = { page: 'not-a-number' };
      const { error } = queryPageSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"page" must be a number');
    });

    it('should fail when page is negative', () => {
      const invalidData = { page: -1 };
      const { error } = queryPageSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toEqual(
        '"page" must be a positive number',
      );
    });
  });

  describe('idParamSchema', () => {
    it('should pass when valid id (UUID) is provided', () => {
      const validData = { id: 'c1e4c3fc-4f8d-45f2-bf7b-c56f3aaf70f5' };
      const { error } = idParamSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should fail when id is missing', () => {
      const invalidData = {};
      const { error } = idParamSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"id" is required');
    });

    it('should fail when id is not a valid UUID', () => {
      const invalidData = { id: 'invalid-uuid' };
      const { error } = idParamSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"id" must be a valid GUID');
    });
  });
});
