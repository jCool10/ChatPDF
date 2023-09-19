import { Router } from 'express'
import chatPDFController from '~/controllers/chatPDF.controller'
import asyncHandler from '~/helpers/asyncHandler'

const router: Router = Router()

router.post('/new', asyncHandler(chatPDFController.new))
router.post('/ask', asyncHandler(chatPDFController.ask))

export default router
