import * as fs from 'fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import * as path from 'path'
import { VectorDBQAChain } from 'langchain/chains'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { Document } from 'langchain/document'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { CharacterTextSplitter, RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { HNSWLib } from 'langchain/vectorstores/hnswlib'
import { PDFPage } from '~/@type'
import { OPENAI_API_KEY } from '~/constants'
import { Pinecone } from '@pinecone-database/pinecone'
import { PineconeStore } from 'langchain/vectorstores/pinecone'
import { RetrievalQAChain, loadQAStuffChain } from 'langchain/chains'
import { FaissStore } from 'langchain/vectorstores/faiss'
import { ConversationalRetrievalQAChain } from 'langchain/chains'

import * as dotenv from 'dotenv'

dotenv.config()

// import { setAPIKey } from 'langchain/'

const embeddingModel = new OpenAIEmbeddings({
  maxConcurrency: 5,
  // openAIApiKey: OPENAI_API_KEY
  openAIApiKey: process.env.OPENAI_API_KEY
})

const embedding = new OpenAIEmbeddings()

const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 4000,
  chunkOverlap: 20
})

const splitter = new CharacterTextSplitter({
  chunkSize: 200,
  chunkOverlap: 50
})

const model = new ChatOpenAI({
  temperature: 0,
  // openAIApiKey: OPENAI_API_KEY,
  modelName: 'gpt-3.5-turbo',
  openAIApiKey: process.env.OPENAI_API_KEY
})

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

  // const loader = new PDFLoader('D:/Workspace/Web/Projects/ChatPDF/server/src/utils/NextJS-Ebook-Old.pdf')

  // const docs = await loader.load()

  const chunkedDocuments = await splitter.splitDocuments(documents)

  console.log('chunkedDocuments', chunkedDocuments)

  const vectorStore = await FaissStore.fromDocuments(chunkedDocuments, embeddingModel)

  await vectorStore.save('./Store/')
}

export async function askQuestion(chatId: string, question: string) {
  console.log(chatId)
  const vectorStore = await FaissStore.load('./Store/', embedding)

  // console.log('vectorStore', vectorStore)

  // const chain = VectorDBQAChain.fromLLM(model, vectorStore, {
  //   k: 5,
  //   returnSourceDocuments: true
  // })

  console.log('vectorStore', vectorStore)

  // const chain = new RetrievalQAChain({
  //   combineDocumentsChain: loadQAStuffChain(model),
  //   retriever: vectorStore.asRetriever(),
  //   returnSourceDocuments: true
  // })

  const chain = ConversationalRetrievalQAChain.fromLLM(model, vectorStore.asRetriever(), {
    qaTemplate: QA_TEMPLATE,
    questionGeneratorTemplate: CONDENSE_TEMPLATE,
    returnSourceDocuments: true //The number of source documents returned is 4 by default
  })

  console.log(await chain.call({ query: question }))

  // console.log(chain.call({ question }))

  const { text: responseText, sourceDocuments } = (await chain.call({
    query: question
  })) as { text: string; sourceDocuments?: Document[] }

  // console.log({ responseText, sourceDocuments })

  // sourceDocuments?.map((item) => console.log(item.pageContent))

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

const CONDENSE_TEMPLATE = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.

Chat History:
{chat_history}
Follow Up Input: {question}
Standalone question:`

const QA_TEMPLATE = `You are a helpful AI assistant. Use the following pieces of context to answer the question at the end.
If you don't know the answer, just say you don't know. DO NOT try to make up an answer.
If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context.

{context}

Question: {question}
Helpful answer in markdown:`

export const makeChain = (vectorstore: PineconeStore) => {
  const model = new ChatOpenAI({
    temperature: 0, // increase temepreature to get more creative answers
    modelName: 'gpt-3.5-turbo' //change this to gpt-4 if you have access
  })

  const chain = ConversationalRetrievalQAChain.fromLLM(model, vectorstore.asRetriever(), {
    qaTemplate: QA_TEMPLATE,
    questionGeneratorTemplate: CONDENSE_TEMPLATE,
    returnSourceDocuments: true //The number of source documents returned is 4 by default
  })
  return chain
}
