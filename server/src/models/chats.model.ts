import { Schema, model } from 'mongoose'
// import { IMessage } from './message.model'

const DOCUMENT_NAME = 'Chat'
const COLLECTION_NAME = 'Chats'

export interface IChat {
  fileKey: string
  fileName: string

  userId: string
}

const chatsSchema: Schema<IChat> = new Schema(
  {
    fileKey: { type: String, required: true },
    fileName: { type: String, required: true },

    userId: { type: String, required: true }
    // message: { type: Array }
  },
  { timestamps: true, collection: COLLECTION_NAME }
)

export const ChatsModel = model<IChat>(DOCUMENT_NAME, chatsSchema)
