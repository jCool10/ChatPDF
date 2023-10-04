import axios, { AxiosInstance } from "axios";

class Http {
  instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: "http://localhost:5000/api/chatPDF",
      timeout: 10000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.instance.interceptors.request.use(
      (config) => config,
      (error) => Promise.reject(error)
    );

    this.instance.interceptors.response.use(
      (response) => response,
      (error) => Promise.reject(error)
    );
  }
}

const http = new Http().instance;

export default http;
