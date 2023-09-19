import { PDFPage } from "@/lib/shared";
import http from "@/utils/http";
import axios from "axios";

interface INew {
  chatId: string;
}

const chatsApi = {
  new: (body: Array<PDFPage>) => http.post<INew>("/new", body),
};

export default chatsApi;
