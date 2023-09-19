import { Schema, model } from 'mongoose'
import { IMessage } from './message.model'

const DOCUMENT_NAME = 'Chat'
const COLLECTION_NAME = 'Chats'

export interface IChat {
  userId: string
  chatId: string
  message: Array<IMessage>
}

const chatsSchema: Schema<IChat> = new Schema(
  {
    userId: { type: String, required: true },
    chatId: { type: String, required: true }
    // message: { type: Array }
  },
  { timestamps: true, collection: COLLECTION_NAME }
)

export const ChatsModel = model<IChat>(DOCUMENT_NAME, chatsSchema)
