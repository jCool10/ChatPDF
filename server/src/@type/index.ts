export type PDFPage = {
  textContent: string
  page: number
}

export type PDFFile = {
  PDFPage: Array<PDFPage>
  chatId: string
}

export type PDFChatQuestion = {
  question: string
  chatId: string
}

export type AWSFile = {
  fileKey: string
  fileName: string
  userId: string
}
