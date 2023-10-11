"use client";

import { useMutation } from "@tanstack/react-query";
import { AlertCircle, FileUp, Inbox, Loader2 } from "lucide-react";
import React, { useRef, useState } from "react";
import axios from "axios";
import { redirect, useRouter } from "next/navigation";
import { getS3Url, uploadToS3 } from "@/utils/aws";
import { Button } from "../ui/button";
import { Alert, AlertDescription } from "../ui/alert";
import chatsApi from "@/apis/chats.api";
import { AWSFile, PDFFile, SuccessResponse } from "@/lib/shared";
// import { PDFFile } from "../../../../server/src/@type";

const maxFileSize = 20 * 100_000_000;

interface Props {
  userId: string;
}

interface INew {
  chatId: string;
}

const FileUpload = ({ userId }: Props) => {
  const pdfRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [chatId, setChatId] = useState<string | null>(null);
  const [fileValidationError, setFileValidationError] = useState<string | null>(
    null
  );

  const createPDFMutation = useMutation({
    mutationFn: (body: AWSFile) => chatsApi.create(body),
  });

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) {
      return;
    }

    setFileValidationError(null);

    const [file] = Array.from(event.target.files);
    // console.log("file", file);
    if (file && file.size > maxFileSize) {
      setFileValidationError(
        `The file size must not exceed ${
          Math.round(maxFileSize) / 1_000_000
        } MB.`
      );
      return;
    }

    console.log("file", file);

    setLoading(true);
    const data = await uploadToS3(file);
    console.log("data - aws", data);
    setLoading(false);

    if (data) {
      // Save vào DB
      setLoading(true);
      createPDFMutation.mutate(
        { ...data, userId },
        {
          onSuccess: (data) => {
            console.log(data.data.metadata.chatId);
            router.push(`/chat/${data.data.metadata.chatId}`);
          },
          onError: (error) => console.log(error),
        }
      );
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        ref={pdfRef}
        type="file"
        name="pdf"
        accept="application/pdf"
        className="hidden"
        onChange={uploadFile}
      />
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <Button
          disabled={loading}
          onClick={(e) => {
            e.preventDefault();
            pdfRef?.current?.click();
          }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Please wait
            </>
          ) : (
            <>
              <FileUp className="w-4 h-4 mr-2" /> Upload{" "}
              {chatId ? "another" : "your"} PDF
            </>
          )}
        </Button>
        <div className="max-w-[400px] text-sm text-muted-foreground">
          {
            "Don't close the browser tab to lose the chat. The chat with your PDF is available for the next 24 hours."
          }
        </div>
      </div>
      {fileValidationError && (
        <Alert variant="destructive" className="mt-2 w-[300px]">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{fileValidationError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default FileUpload;
