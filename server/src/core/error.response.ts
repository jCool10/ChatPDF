import { ReasonPhrases, StatusCodes } from '../constants/httpStatusCode'

class ErrorResponse extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
  }
}

class ConflictRequestError extends ErrorResponse {
  constructor(message = ReasonPhrases.CONFLICT, statusCode = StatusCodes.CONFLICT) {
    super(message, statusCode)
  }
}

class BadRequestError extends ErrorResponse {
  constructor(message = ReasonPhrases.BAD_REQUEST, statusCode = StatusCodes.BAD_REQUEST) {
    super(message, statusCode)
  }
}

class AuthFailureError extends ErrorResponse {
  constructor(message = ReasonPhrases.UNAUTHORIZED, status = StatusCodes.UNAUTHORIZED) {
    super(message, status)
  }
}

class NotFoundError extends ErrorResponse {
  constructor(message = ReasonPhrases.NOT_FOUND, status = StatusCodes.NOT_FOUND) {
    super(message, status)
  }
}

class ForbiddenError extends ErrorResponse {
  constructor(message = ReasonPhrases.FORBIDDEN, status = StatusCodes.FORBIDDEN) {
    super(message, status)
  }
}

export { AuthFailureError, BadRequestError, ConflictRequestError, ErrorResponse, ForbiddenError, NotFoundError }
