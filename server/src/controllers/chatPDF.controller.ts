import { NextFunction, Request, Response } from 'express'

import core from 'express-serve-static-core'
import { AWSFile, PDFChatQuestion, PDFFile, PDFPage } from '~/@type'
import { SuccessResponse } from '~/core/success.response'
import asyncCatch from '~/helpers/cathAsync'
import chatPDFService from '~/services/chatPDFService'

class chatPDFController {
  static getChatDetail = asyncCatch(async (req: Request, res: Response, next: NextFunction) => {
    new SuccessResponse({
      metadata: await chatPDFService.getChatDetail(req.params.chatId)
    }).send(res)
  })

  static getChats = asyncCatch(
    async (req: Request<core.ParamsDictionary, any, string>, res: Response, next: NextFunction) => {
      new SuccessResponse({
        metadata: await chatPDFService.getChats(req.body)
      }).send(res)
    }
  )

  static new = asyncCatch(
    async (req: Request<core.ParamsDictionary, any, Array<PDFPage>>, res: Response, next: NextFunction) => {
      new SuccessResponse({
        metadata: await chatPDFService.new(req.body)
      }).send(res)
    }
  )

  static create = asyncCatch(
    async (req: Request<core.ParamsDictionary, any, AWSFile>, res: Response, next: NextFunction) => {
      new SuccessResponse({
        metadata: await chatPDFService.create(req.body)
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
