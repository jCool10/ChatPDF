import { NextFunction, Request, Response } from 'express'

// eslint-disable-next-line @typescript-eslint/ban-types
const asyncHandler = (fn: Function) => {
  return function (req: Request, res: Response, next: NextFunction) {
    fn(req, res, next).catch(next)
  }
}

export default asyncHandler
