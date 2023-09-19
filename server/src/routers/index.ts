import { Router } from 'express'
import chatPDFRouter from './chatPDF.router'

const router: Router = Router()

router.use('/chatPDF', chatPDFRouter)

export default router
