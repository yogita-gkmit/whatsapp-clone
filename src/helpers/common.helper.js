// throw custom error with message and statuscode
function customError(message, statusCode = 400) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}

module.exports = { customError };
