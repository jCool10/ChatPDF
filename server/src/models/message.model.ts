import { Schema, model } from 'mongoose'

const DOCUMENT_NAME = 'Message'
const COLLECTION_NAME = 'Messages'

export interface IMessage {
  userId: string
  chatId: string
  content: string
}

const messageSchema: Schema<IMessage> = new Schema(
  {
    userId: { type: String, required: true },
    chatId: { type: String, required: true },
    content: { type: String }
  },
  { timestamps: true, collection: COLLECTION_NAME }
)

export const MessageModel = model<IMessage>(DOCUMENT_NAME, messageSchema)
