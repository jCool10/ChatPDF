// import { SuccessResponse } from "~/core/success.response";
import { PDFFile } from "./../../../server/src/@type/index";
import { AWSFile, PDFPage, SuccessResponse } from "@/lib/shared";
import http from "@/utils/http";
import axios from "axios";

interface INew {
  chatId: string;
}

interface IFile {
  fileKey: string;
  fileName: string;
  _id: string;
}

interface IGetChat {
  chats: IFile[];
}

const chatsApi = {
  new: (body: any) => http.post<INew>("/new", body),
  process: (body: any) => http.post<any>("/process", body),
  create: (body: AWSFile) => http.post<SuccessResponse<INew>>("/create", body),
  getChats: (body: { userId: string }) =>
    http.get<SuccessResponse<IGetChat>>(`/get`, { data: body }),
  getChatDetail: (chatId: string) =>
    http.get<SuccessResponse<IFile>>(`/get/${chatId}`),
  ingest: (body: any) => http.post("/ingest", body),
  chat: (body: any) => http.post("/chat", body),
};

export default chatsApi;
