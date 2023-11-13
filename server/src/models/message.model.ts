import { Schema, model } from 'mongoose'

const DOCUMENT_NAME = 'Messages'
const COLLECTION_NAME = 'Messages'

// export interface IMessages {
//   messages: Array<IMessage>
//   history: Array<any>
// }

// interface IMessage {
//   message: string
//   type: string
//   sourceDocs?: Array<Document>
// }

const messageSchema = new Schema({
  type: {
    type: String,
    enum: ['apiMessage', 'userMessage'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  sourceDocs: Array<Document>
})

const messagesSchema = new Schema(
  {
    messages: [messageSchema],
    history: [[String, String]]
  },
  { timestamps: true, collection: COLLECTION_NAME }
)

export const MessagesModel = model(DOCUMENT_NAME, messagesSchema)
