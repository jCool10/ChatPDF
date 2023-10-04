// import { PDFChatQuestion, PDFPage } from '~/@type/index.js'
// import { BadRequestError } from '~/core/error.response.js'
// import { askQuestion, createChat } from '~/utils/langchain.js'

import { AWSFile, PDFChatQuestion, PDFFile, PDFPage } from '~/@type'
import { BadRequestError, ErrorResponse, NotFoundError } from '~/core/error.response'
import { ChatsModel } from '~/models/chats.model'
import { askQuestion, createChat } from '~/utils/langchain'

interface IChat {
  fileKey: string
  fileName: string
  userId: string
}
class chatPDFService {
  static getChatDetail = async (payload: string) => {
    const chatId = payload
    console.log('chatId', chatId)
    const chat = await ChatsModel.findById(chatId)

    console.log('payload', payload)

    console.log('chat', chat)

    return { chat }
  }

  static getChats = async (payload: string) => {
    const userId = 'user_2VWjXk0ANcXP1VyOjgvGJ8VBwcc'

    const select = { fileKey: 1, fileName: 2 }
    const chats = await ChatsModel.find<IChat>({ userId }).select(select)

    if (!chats) throw new NotFoundError('Chat not found')

    return { chats }
  }

  static new = async (req: Array<PDFPage>) => {
    const pages = req

    if (pages.length == 0) throw new BadRequestError('At least one PDF page required')

    // const chatId = await createChat(pages)

    return {}
  }

  static create = async (req: AWSFile) => {
    console.log(req)
    // const { PDFPage, chatId } = req
    const { fileKey, fileName, userId } = req

    const newChat = await ChatsModel.create({ fileKey, fileName, userId })

    if (newChat) {
      return {
        chatId: newChat._id
      }
    }
  }

  static ask = async (req: PDFChatQuestion) => {
    const chatQuestion = req

    const { pages, text } = await askQuestion(chatQuestion.chatId, chatQuestion.question)

    return { text, pages }
  }
}

export default chatPDFService
