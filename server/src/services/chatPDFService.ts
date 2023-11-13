// import { metadata } from './../../../client/src/app/layout';
import { PDFLoader } from 'langchain/document_loaders/fs/pdf'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { AWSFile, PDFChatQuestion, PDFFile, PDFPage } from '~/@type'
import { BadRequestError, ErrorResponse, NotFoundError } from '~/core/error.response'
import { ChatsModel } from '~/models/chats.model'
import { askQuestion, createChat, makeChain } from '~/utils/langchain'
import pinecone from '~/utils/pinecone'
// import { pinecone } from '~/utils/pinecone'
import { downloadFromS3 } from '~/utils/s3'
import { AIMessage, HumanMessage } from 'langchain/schema'
import { Pinecone } from '@pinecone-database/pinecone'

interface IChat {
  fileKey: string
  fileName: string
  userId: string
}
class chatPDFService {
  static chat = async (payload: any) => {
    console.log(payload)
    const { question, history, fileKey } = payload

    const sanitizedQuestion = question.trim().replaceAll('\n', ' ')

    // await pinecone

    const index = (await pinecone).Index('chat-pdf')

    const vectorStore = await PineconeStore.fromExistingIndex(new OpenAIEmbeddings({}), {
      pineconeIndex: index,
      textKey: 'text'
      // namespace: fileKey //namespace comes from your config folder
    })

    const chain = makeChain(vectorStore)

    const pastMessages = history.map((message: string, i: number) => {
      if (i % 2 === 0) {
        return new HumanMessage(message)
      } else {
        return new AIMessage(message)
      }
    })

    const response = await chain.call({
      question: sanitizedQuestion,
      chat_history: pastMessages
    })

    console.log('response', response)

    const sourceDocuments = (
      response.sourceDocuments
        ? response.sourceDocuments
            .map((source: any) => {
              console.log(source)
              return source.metadata['loc.pageNumber']
            })
            .sort((a: number, b: number) => a - b)
        : []
    ).filter((value: any, index: any, self: string | any[]) => self.indexOf(value) === index)

    return { text: response.text, sourceDocuments }
  }

  static ingest = async (payload: any) => {
    // file key
    console.log(payload)
    const { fileKey } = payload
    const filePath = await downloadFromS3(fileKey)

    const loader = new PDFLoader(filePath)

    const rawDocs = await loader.load()

    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 4000,
      chunkOverlap: 200
    })

    const docs = await textSplitter.splitDocuments(rawDocs)
    console.log('split docs', docs)

    const embeddings = new OpenAIEmbeddings()

    const index = (await pinecone).Index('chat-pdf') //change to your own index name

    await PineconeStore.fromDocuments(docs, embeddings, {
      pineconeIndex: index,
      // namespace: fileKey,
      textKey: 'text'
    })

    return {}
  }

  static process = async (req: any) => {
    console.log('req - process', req)
    const { pages, chatDetailId } = req

    if (pages.length == 0) {
      throw new BadRequestError('At least one PDF page required')
    }

    await createChat({ PDFPage: pages, chatDetailId })

    return { success: true }
  }

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
    const chats = await ChatsModel.find<IChat>({ userId }).select(select).sort({ createdAt: -1 })

    if (!chats) throw new NotFoundError('Chat not found')

    return { chats }
  }

  static new = async (req: any) => {
    const { pages, chatDetailId } = req

    if (pages.length == 0) throw new BadRequestError('At least one PDF page required')

    await createChat({ PDFPage: pages, chatDetailId })

    return {
      chatDetailId,
      success: true
    }
  }

  static create = async (req: AWSFile) => {
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
