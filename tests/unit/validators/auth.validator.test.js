const Joi = require('joi');
const {
  registerSchema,
  sendOTPSchema,
  verifyOTPSchema,
} = require('../../../src/validators/auth.validator');

describe('Validation Schemas Tests', () => {
  describe('registerSchema', () => {
    it('should pass when valid data is provided', () => {
      const validData = {
        name: 'John Doe',
        about: 'This is about John',
        email: 'johndoe@example.com',
      };

      const { error } = registerSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should fail when missing required "about" field', () => {
      const invalidData = {
        name: 'John Doe',
        email: 'johndoe@example.com',
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"about" is required');
    });

    it('should fail when missing required "email" field', () => {
      const invalidData = {
        name: 'John Doe',
        about: 'This is about John',
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"email" is required');
    });

    it('should fail when "email" is not a valid email address', () => {
      const invalidData = {
        name: 'John Doe',
        about: 'This is about John',
        email: 'invalid-email',
      };

      const { error } = registerSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"email" must be a valid email');
    });
  });

  describe('sendOTPSchema', () => {
    it('should pass when a valid email is provided', () => {
      const validData = {
        email: 'johndoe@example.com',
      };

      const { error } = sendOTPSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should fail when missing required "email" field', () => {
      const invalidData = {};

      const { error } = sendOTPSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"email" is required');
    });

    it('should fail when "email" is not a valid email address', () => {
      const invalidData = {
        email: 'invalid-email',
      };

      const { error } = sendOTPSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"email" must be a valid email');
    });
  });

  describe('verifyOTPSchema', () => {
    it('should pass when valid email and OTP are provided', () => {
      const validData = {
        email: 'johndoe@example.com',
        otp: '123456',
      };

      const { error } = verifyOTPSchema.validate(validData);
      expect(error).toBeUndefined();
    });

    it('should fail when missing required "email" field', () => {
      const invalidData = {
        otp: '123456',
      };

      const { error } = verifyOTPSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"email" is required');
    });

    it('should fail when missing required "otp" field', () => {
      const invalidData = {
        email: 'johndoe@example.com',
      };

      const { error } = verifyOTPSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe('"otp" is required');
    });

    it('should fail when "otp" is not exactly 6 characters', () => {
      const invalidData = {
        email: 'johndoe@example.com',
        otp: '12345',
      };

      const { error } = verifyOTPSchema.validate(invalidData);
      expect(error).toBeDefined();
      expect(error.details[0].message).toBe(
        '"otp" length must be 6 characters long',
      );
    });
  });
});
