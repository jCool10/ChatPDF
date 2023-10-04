"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Bot, FileUp, Loader2 } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";

import { PDFPage } from "@/lib/shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

// import { Chat } from "./Chat";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import chatsApi from "@/apis/chats.api";
import { getS3Url, uploadToS3 } from "@/utils/aws";
import { Chat } from "@/app/Chat";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();

const maxFileSize = 20 * 100_000_000;

const newChat = async (documents: PDFPage[]) => {
  try {
    // const response = await fetch(`http://localhost:5000/api/chatPDF/new`, {
    //   mode: "no-cors",
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(documents),
    // });

    const response = await axios.post(
      "http://localhost:5000/api/chatPDF/new",
      // JSON.stringify(documents)
      documents
    );

    console.log("response", response);

    if (response.status == 200) {
      return {
        success: true,
        chatId: response.data.metadata.chatId,
      };
    }

    return null;
  } catch (e) {
    console.error(e);

    return null;
  }
};

const extractPageText = async (page: any) => {
  const textContent = await page.getTextContent();

  let lastY,
    text = "";
  for (let item of textContent.items) {
    if (lastY == item.transform[5] || !lastY) {
      text += item.str;
    } else {
      text += "\n" + item.str;
    }

    lastY = item.transform[5];
  }

  return text;
};

export function PDFViewer({ pdfUrl }: { pdfUrl: string }) {
  // console.log(fileKey);
  // console.log(getS3Url(fileKey));
  const { toast } = useToast();

  const pdfRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfFile, setPdfFile] = useState<string>(pdfUrl);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [chatId, setChatId] = useState<string | null>(null);
  const [fileValidationError, setFileValidationError] = useState<string | null>(
    null
  );

  useEffect(() => {
    setPdfFile(pdfUrl);
  }, [pdfUrl]);

  console.log("pdfFile", pdfFile);

  const onDocumentLoadSuccess = async (document: any) => {
    console.log("document", document);
    setProgress(0);
    setNumPages(document.numPages);

    const result = await processDocument(document, () => setProgress(20));

    console.log("result", result);
    setProgress(100);
    setLoading(false);
    if (result?.success && result.chatId) {
      setChatId(result.chatId);
      return;
    }

    toast({
      variant: "destructive",
      title: "Uh oh! Something went wrong.",
      description: "There was a problem with your request.",
    });
  };

  const createChatPDFMutation = useMutation({
    mutationFn: (body: Array<PDFPage>) => chatsApi.new(body),
  });

  const processDocument = async (
    document: any,
    onTextExtracted: () => void
  ) => {
    console.log(document);
    const pages: PDFPage[] = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
      const page = await document.getPage(pageNumber);
      const pageText = await extractPageText(page);

      pages.push({
        page: pageNumber,
        textContent: pageText,
      });
    }

    onTextExtracted();

    createChatPDFMutation.mutate(pages, {
      onSuccess: (data) => {
        console.log("mutation data", data);
      },
      onError: (error) => {
        console.log(error);
        return null;
      },
    });

    return await newChat(pages);
  };

  function onDocumentLoadError() {
    console.log("onDocumentLoadError");
    setLoading(false);
  }

  const hasNextPage = () => numPages != null && pageNumber < numPages;
  const hasPreviousPage = () => pageNumber > 1;

  const onPreviousPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };
  const onNextPage = () => {
    if (numPages && pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  return (
    <>
      {pdfFile && (
        // md:grid-cols-2
        <div className={`mt-4 grid grid-cols-1 gap-10 `}>
          <div className="flex flex-col py-4 rounded-lg bg-muted">
            {numPages && numPages > 1 && (
              <div className="flex flex-row items-center justify-center gap-2 pb-4">
                <div>
                  <Button
                    variant="outline"
                    onClick={onPreviousPage}
                    disabled={!hasPreviousPage()}
                  >
                    ← Previous
                  </Button>
                </div>
                <div>
                  {pageNumber} / {numPages}
                </div>
                <div>
                  <Button
                    variant="outline"
                    onClick={onNextPage}
                    disabled={!hasNextPage()}
                  >
                    Next →
                  </Button>
                </div>
              </div>
            )}
            <Document
              file={pdfFile}
              onLoadError={onDocumentLoadError}
              onLoadSuccess={onDocumentLoadSuccess}
              className="mx-auto container"
            >
              <Page
                // width={400}
                pageNumber={pageNumber}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                className="container"
              />
            </Document>
          </div>
        </div>
      )}
    </>
  );
}
