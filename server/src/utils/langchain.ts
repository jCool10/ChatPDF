import { randomBytes } from 'crypto'
import * as fs from 'fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as path from 'path'
import { VectorDBQAChain } from 'langchain/chains'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { Document } from 'langchain/document'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { HNSWLib } from 'langchain/vectorstores/hnswlib'
import { PDFPage } from '~/@type'
import { OPENAI_API_KEY } from '~/constants'
// import { setAPIKey } from 'langchain/'

const embeddingModel = new OpenAIEmbeddings({
  maxConcurrency: 5,
  openAIApiKey: OPENAI_API_KEY
  // openAIApiKey: process.env.OPENAI_API_KEY
})
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 4000,
  chunkOverlap: 20
})

const model = new ChatOpenAI({
  temperature: 0,
  openAIApiKey: OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo'
})

const createStoreDir = async (chatId: string) => {
  const path = storePath(chatId)
  await fs.mkdir(path, { recursive: true })

  return path
}

const storePath = (chatId: string) => {
  return path.join(tmpdir(), 'chat-pdf', chatId)
}

function getHoursDiff(a: Date, b: Date): number {
  const diffInMilliseconds = a.getTime() - b.getTime()
  const diffInHours = diffInMilliseconds / (1000 * 60 * 60)

  return diffInHours
}

export async function removeOutdatedChats() {
  const ttlHours = 24
  const now = new Date()

  const storageDir = join(tmpdir(), 'damngood.tools', 'chat-pdf')
  const files = await fs.readdir(storageDir, { withFileTypes: true })

  for (const file of files) {
    if (file.isDirectory()) {
      const fullPath = path.join(storageDir, file.name)
      const stats = await fs.stat(fullPath)

      if (getHoursDiff(now, stats.birthtime) > ttlHours) {
        await fs.rm(fullPath, { recursive: true, force: true })
      }
    }
  }
}

interface ICreate {
  PDFPage: Array<PDFPage>
  chatDetailId: string
}

export async function createChat({ PDFPage, chatDetailId }: ICreate) {
  const documents = PDFPage.map(
    (page) =>
      new Document({
        pageContent: page.textContent,
        metadata: {
          page: page.page
        }
      })
  )

  const chunkedDocuments = await textSplitter.splitDocuments(documents)

  const vectorStore = await HNSWLib.fromDocuments(chunkedDocuments, embeddingModel)

  console.log('vectorStore', vectorStore)

  await vectorStore.save(chatDetailId)
}

export async function askQuestion(chatId: string, question: string) {
  const vectorStore = await HNSWLib.load(chatId, embeddingModel)
  console.log(vectorStore)

  const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
    k: 5,
    returnSourceDocuments: true
  })
  const { text: responseText, sourceDocuments } = (await chain.call({
    query: question
  })) as { text: string; sourceDocuments?: Document[] }

  // console.log({ responseText, sourceDocuments })

  // sourceDocuments?.map((item) => console.log(item.pageContent))
  console.log(responseText)

  const pages = (
    (sourceDocuments ? sourceDocuments.map((d) => d.metadata.page).sort((a, b) => a - b) : []) as number[]
  ).filter((value, index, self) => {
    return self.indexOf(value) === index
  })

  return {
    text: responseText,
    pages
  }
}
