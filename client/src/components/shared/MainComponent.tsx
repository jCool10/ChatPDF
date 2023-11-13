"use client";

import { useEffect, useRef, useState } from "react";
import { AlertCircle, Bot, FileUp, Loader2 } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";

import { PDFPage } from "@/lib/shared";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";

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

interface chatPDFNew {
  pages: Array<PDFPage>;
  chatDetailId: string;
}

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

interface Props {
  pdfUrl: string;
  chatDetailId: string;
  fileKey: string;
}

export function MainComponent({ pdfUrl, chatDetailId, fileKey }: Props) {
  useEffect(() => {
    setPdfFile(pdfUrl);
    setChatId(chatDetailId);
  }, [chatDetailId, pdfUrl]);

  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [chatId, setChatId] = useState<string | null>(null);

  const onDocumentLoadSuccess = async (document: any) => {
    console.log("document", document);
    setProgress(0);
    setNumPages(document.numPages);

    // const result = await processDocument(document, () => setProgress(20));
    const result = await ingestDocument(fileKey, () => setProgress(20));
    console.log("result", result);

    setProgress(100);
    setLoading(false);
    if (result) {
      return;
    }

    toast({
      variant: "destructive",
      title: "Uh oh! Something went wrong.",
      description: "There was a problem with your request.",
    });
  };

  const ingestDocument = async (fileKey: any, ingested: () => void) => {
    ingestMutation(
      { fileKey },
      {
        onSuccess: (_) => {
          toast({
            title: "Process Document Success!!",
          });
        },
        onError: (error) => {
          console.log(error);
          return false;
        },
      }
    );

    ingested();

    return true;
  };

  const { mutate: ingestMutation } = useMutation({
    mutationFn: (payload: any) => chatsApi.ingest(payload),
  });

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
        <div className={`mt-4 grid grid-cols-1 gap-10 md:grid-cols-2`}>
          <div className="flex flex-col p-4 rounded-lg bg-muted">
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
                width={300}
                pageNumber={pageNumber}
                renderAnnotationLayer={false}
                renderTextLayer={false}
                className="container"
              />
            </Document>
          </div>
          <div>
            {!chatId && (
              <div>
                <span className="flex flex-row items-center">
                  <Bot className="w-4 h-4 mr-2 animate-pulse " />
                  The chat is being prepared...
                </span>
                <Progress value={progress} className="mt-2 w-[300px]" />
              </div>
            )}
            {chatId && (
              <Chat
                fileKey={fileKey}
                chatId={chatId}
                showPages={numPages != null && numPages > 1}
                onGoToPage={(newPage) => setPageNumber(newPage)}
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}
