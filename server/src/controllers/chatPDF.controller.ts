import { NextFunction, Request, Response } from 'express'

import core from 'express-serve-static-core'
import { PDFChatQuestion, PDFPage } from '~/@type'
import { SuccessResponse } from '~/core/success.response'
import asyncCatch from '~/helpers/cathAsync'
import chatPDFService from '~/services/chatPDFService'

class chatPDFController {
  static new = asyncCatch(
    async (req: Request<core.ParamsDictionary, any, Array<PDFPage>>, res: Response, next: NextFunction) => {
      new SuccessResponse({
        metadata: await chatPDFService.new(req.body)
      }).send(res)
    }
  )

  static ask = asyncCatch(
    async (req: Request<core.ParamsDictionary, any, PDFChatQuestion>, res: Response, next: NextFunction) => {
      new SuccessResponse({
        metadata: await chatPDFService.ask(req.body)
      }).send(res)
    }
  )
}

export default chatPDFController
