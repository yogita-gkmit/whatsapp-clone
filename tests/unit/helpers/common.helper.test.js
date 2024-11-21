const { customError } = require('../../../src/helpers/common.helper');

describe('customError function', () => {
  it('should return an error with the correct message and default status code 400', () => {
    const message = 'Something went wrong';
    const error = customError(message);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(400);
  });

  it('should return an error with the correct message and custom status code', () => {
    const message = 'Not Found';
    const statusCode = 404;
    const error = customError(message, statusCode);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(message);
    expect(error.statusCode).toBe(statusCode);
  });

  it('should default to status code 400 if only message is provided', () => {
    const message = 'Invalid request';
    const error = customError(message);

    expect(error).toHaveProperty('statusCode', 400);
    expect(error.message).toBe(message);
  });

  it('should create an error object with the correct type and message', () => {
    const message = 'Internal server error';
    const error = customError(message);

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe(message);
    expect(error.name).toBe('Error');
  });
});
