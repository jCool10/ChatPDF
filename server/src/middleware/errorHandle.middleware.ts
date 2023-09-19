import { NextFunction, Request, Response } from 'express'
import { ErrorResponse } from '~/core/error.response'

const returnError = (error: ErrorResponse, req: Request, res: Response, next: NextFunction) => {
  const statusCode = error.statusCode || 500
  return res.status(statusCode).json({
    status: statusCode,
    stack: error.stack,
    message: error.message || 'Internal Server Error'
  })
}

const notFoundError = (req: Request, res: Response, next: NextFunction) => {
  const error = new ErrorResponse('Not found', 404)
  next(error)
}

export { notFoundError, returnError }
