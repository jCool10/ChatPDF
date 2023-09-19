import { Response } from 'express'
import { ReasonPhrases, StatusCodes } from '../constants/httpStatusCode'

class SuccessResponse {
  message: string
  status: number
  metadata?: object
  reasonStatusCode?: string

  constructor({
    message = ReasonPhrases.OK,
    statusCode = StatusCodes.OK,
    metadata = {},
    reasonStatusCode = ReasonPhrases.OK
  }) {
    this.message = message
    this.status = statusCode
    this.metadata = metadata
    this.reasonStatusCode = reasonStatusCode
  }

  send(res: Response) {
    return res.status(this.status).json(this)
  }
}

class OK extends SuccessResponse {
  constructor({ message = ReasonPhrases.OK, metadata = {} }) {
    super({ message, metadata })
  }
}

class Create extends SuccessResponse {
  constructor({ message = '', metadata = {} }) {
    super({
      message,
      statusCode: StatusCodes.CREATED,
      reasonStatusCode: ReasonPhrases.CREATED,
      metadata
    })
  }
}

export { Create, OK, SuccessResponse }
