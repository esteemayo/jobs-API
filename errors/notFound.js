const { StatusCodes } = require('http-status-codes');
const AppError = require('../errors/appError');

class NotFoundError extends AppError {
  constructor(message) {
    super(message);

    this.statusCode = StatusCodes.NOT_FOUND;
    this.status = 'fail';
  }
}

module.exports = NotFoundError;
