const { validate } = require('../../../src/middlewares/validators.middleware');
const Joi = require('joi');

describe('Validation Middleware Tests', () => {
  let mockRequest, mockResponse, next, mockSchema;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();

    mockSchema = {
      validate: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Validation with body', () => {
    it('should call next() when validation passes', () => {
      const body = { name: 'John Doe' };

      mockRequest.body = body;

      mockSchema.validate.mockReturnValue({ error: null });

      const validationMiddleware = validate(mockSchema);
      validationMiddleware(mockRequest, mockResponse, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 400 when validation fails', () => {
      const body = { name: 'John Doe' };

      mockRequest.body = body;

      mockSchema.validate.mockReturnValue({
        error: {
          details: [{ message: 'Name is required', path: ['name'] }],
        },
      });

      const validationMiddleware = validate(mockSchema);

      validationMiddleware(mockRequest, mockResponse, next);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: [{ message: 'Name is required', path: ['name'] }],
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Validation with params', () => {
    it('should call next() when params validation passes', () => {
      const params = { id: 1 };

      mockRequest.params = params;

      mockSchema.validate.mockReturnValue({ error: null });

      const validationMiddleware = validate(mockSchema, true);

      validationMiddleware(mockRequest, mockResponse, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 400 when params validation fails', () => {
      const params = { id: 1 };

      mockRequest.params = params;

      mockSchema.validate.mockReturnValue({
        error: {
          details: [{ message: 'ID is required', path: ['id'] }],
        },
      });

      const validationMiddleware = validate(mockSchema, true);

      validationMiddleware(mockRequest, mockResponse, next);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: [{ message: 'ID is required', path: ['id'] }],
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Validation with query', () => {
    it('should call next() when query validation passes', () => {
      const query = { search: 'test' };

      mockRequest.query = query;

      mockSchema.validate.mockReturnValue({ error: null });

      const validationMiddleware = validate(mockSchema, false, true);

      validationMiddleware(mockRequest, mockResponse, next);

      expect(next).toHaveBeenCalled();
    });

    it('should return 400 when query validation fails', () => {
      const query = { search: 'test' };

      mockRequest.query = query;

      mockSchema.validate.mockReturnValue({
        error: {
          details: [{ message: 'Search term is required', path: ['search'] }],
        },
      });

      const validationMiddleware = validate(mockSchema, false, true);

      validationMiddleware(mockRequest, mockResponse, next);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        errors: [{ message: 'Search term is required', path: ['search'] }],
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
