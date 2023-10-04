import { Router } from 'express'
import chatPDFController from '~/controllers/chatPDF.controller'
import asyncHandler from '~/helpers/asyncHandler'

const router: Router = Router()

router.post('/new', asyncHandler(chatPDFController.new))
router.post('/ask', asyncHandler(chatPDFController.ask))
router.post('/create', asyncHandler(chatPDFController.create))

router.get('/get', asyncHandler(chatPDFController.getChats))
router.get('/get/:chatId', asyncHandler(chatPDFController.getChatDetail))

export default router
