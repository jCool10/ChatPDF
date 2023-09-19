// import { PDFChatQuestion, PDFPage } from '~/@type/index.js'
// import { BadRequestError } from '~/core/error.response.js'
// import { askQuestion, createChat } from '~/utils/langchain.js'

import { PDFChatQuestion, PDFPage } from '~/@type'
import { BadRequestError } from '~/core/error.response'
import { askQuestion, createChat } from '~/utils/langchain'

class chatPDFService {
  static new = async (req: Array<PDFPage>) => {
    const pages = req

    if (pages.length == 0) throw new BadRequestError('At least one PDF page required')

    const chatId = await createChat(pages)

    return { chatId }
  }

  static ask = async (req: PDFChatQuestion) => {
    const chatQuestion = req

    const { pages, text } = await askQuestion(chatQuestion.chatId, chatQuestion.question)

    return { text, pages }
  }
}

export default chatPDFService
