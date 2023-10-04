export type PDFPage = {
  textContent: string;
  page: number;
};

export type PDFFile = {
  PDFPage: Array<PDFPage>;
  chatId: string;
};

export type AWSFile = {
  fileKey: string;
  fileName: String;
  userId: string;
};

export interface SuccessResponse<Data> {
  message: string;
  metadata: Data;
  reasonStatusCode: string;
  status: number;
}
