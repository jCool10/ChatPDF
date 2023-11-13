"use client";

import { useEffect, useRef, useState } from "react";
import { Bot, FileQuestion, Loader2 } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import showdown from "showdown";
import { useMutation } from "@tanstack/react-query";
import chatsApi from "@/apis/chats.api";

interface ChatProps {
  chatId: string;
  onGoToPage: (arg0: number) => void;
  showPages: boolean;
  fileKey: string;
}

interface ChatInteraction {
  isBot: boolean;
  message: string;
  pages?: number[];
}

async function askQuestion(chatId: string, question: string) {
  try {
    // const response = await fetch(`http://localhost:5000/api/chatPDF/new`, {
    //   method: "POST",
    //   body: JSON.stringify({
    //     chatId,
    //     question,
    //   }),
    // });

    const response = await axios.post("http://localhost:5000/api/chatPDF/ask", {
      chatId,
      question,
    });

    // const

    console.log("response", response);

    if (response.status == 200) {
      return {
        success: true,
        result: {
          text: response.data.metadata.text,
          pages: response.data.metadata.pages,
        },
      };
    }

    return null;
  } catch (e) {
    console.error(e);

    return null;
  }
}

type Message = {
  type: "apiMessage" | "userMessage";
  message: string;
  sourceDocs?: Document[];
};

export function Chat({ chatId, showPages, onGoToPage, fileKey }: ChatProps) {
  const { toast } = useToast();
  const [processing, setProcessing] = useState(false);
  const [chatInteractions, setChatInteractions] = useState<ChatInteraction[]>([
    {
      message: "The PDF is processed. You can ask any questions related to it.",
      isBot: true,
    },
  ]);

  const [messageState, setMessageState] = useState<{
    messages: Message[];
    history: [string, string][];
  }>({
    messages: [
      {
        message: "Hi, what would you like to learn about this document?",
        type: "apiMessage",
      },
    ],
    history: [],
  });

  const { messages, history } = messageState;

  const [query, setQuery] = useState<string>("");
  const converter = new showdown.Converter();

  const createMarkup = (value: string) => {
    return { __html: value };
  };

  const { mutate: chatMutation } = useMutation({
    mutationFn: (payload: any) => chatsApi.chat(payload),
  });

  const onAskQuestion = async () => {
    if (!query) return;

    const question = query.trim();

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: "userMessage",
          message: question,
        },
      ],
    }));

    setProcessing(true);
    setQuery("");

    chatMutation(
      { question, history, fileKey },
      {
        onSuccess: (data: any) => {
          console.log("data chat", data.data.metadata);
          const { sourceDocuments, text } = data.data.metadata;
          console.log({ sourceDocuments, text });

          setMessageState((state) => ({
            ...state,
            messages: [
              ...state.messages,
              {
                type: "apiMessage",
                message: text,
                sourceDocs: sourceDocuments,
              },
            ],
            history: [...state.history, [question, text]],
          }));

          console.log("messageState", messageState);

          setProcessing(false);
        },
        onError: (error) => {
          console.log(error);

          return false;
        },
      }
    );

    // setChatInteractions((previousInteractions) => [
    //   ...previousInteractions,
    //   { isBot: false, message: question },
    // ]);

    // setProcessing(true);
    // const result = await askQuestion(chatId, question);
    // setProcessing(false);

    // if (result?.success && result.result) {
    //   const answer = result.result.text;
    //   const pages = result.result.pages;
    //   setChatInteractions((previousInteractions) => [
    //     ...previousInteractions,
    //     { isBot: true, message: answer, pages: pages },
    //   ]);
    //   setQuestion("");

    //   return;
    // }

    // toast({
    //   variant: "destructive",
    //   title: "Uh oh! Something went wrong.",
    //   description: "There was a problem with your request.",
    // });
  };

  const interactionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (interactionsRef?.current?.lastElementChild) {
      interactionsRef.current.lastElementChild.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }
  }, [chatInteractions]);

  return (
    <div className="w-full rounded-lg">
      <div
        ref={interactionsRef}
        className="flex h-[450px] flex-col gap-2 overflow-scroll rounded-lg bg-secondary p-2"
      >
        {/* {chatInteractions.map((i, index) => {
          const message = converter.makeHtml(i.message);
          return (
            <Alert key={index}>
              {i.isBot ? (
                <Bot className="w-4 h-4" />
              ) : (
                <FileQuestion className="w-4 h-4" />
              )}
              <AlertDescription>
                <div dangerouslySetInnerHTML={createMarkup(message)} />
                {showPages && i.pages && i.pages.length > 0 && (
                  <div className="flex flex-row gap-2 mt-2">
                    {i.pages.map((p) => (
                      <Button
                        key={p}
                        variant="outline"
                        size="sm"
                        onClick={() => onGoToPage(p)}
                      >
                        {p}
                      </Button>
                    ))}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          );
        })} */}
        {messages.map((message, index) => (
          <Alert key={index}>
            {message.type === "apiMessage" ? (
              <Bot className="w-4 h-4" />
            ) : (
              <FileQuestion className="w-4 h-4" />
            )}
            <AlertDescription>
              <div dangerouslySetInnerHTML={createMarkup(message.message)} />

              {message.sourceDocs && (
                <div className="flex flex-row gap-2 mt-2">
                  {message.sourceDocs.map((source: any, index) => {
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          onGoToPage(source.metadata["loc.pageNumber"])
                        }
                      >
                        {source.metadata["loc.pageNumber"]}
                      </Button>
                    );
                  })}
                </div>
              )}
              {/* {showPages && i.pages && i.pages.length > 0 && (
                <div className="flex flex-row gap-2 mt-2">
                  {i.pages.map((p) => (
                    <Button
                      key={p}
                      variant="outline"
                      size="sm"
                      onClick={() => onGoToPage(p)}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              )} */}
            </AlertDescription>
          </Alert>
        ))}

        {processing && (
          <Alert key="processing" className="animate-pulse">
            <Bot className="w-4 h-4" />
            <AlertDescription>...</AlertDescription>
          </Alert>
        )}
      </div>
      <form
        className="flex flex-row gap-2 mt-2"
        onSubmit={async (e) => {
          e.preventDefault();
          await onAskQuestion();
        }}
      >
        <Input
          disabled={processing}
          type="text"
          placeholder="Ask any question"
          onChange={(e) => setQuery(e.target.value)}
          value={query}
        />
        <Button type="submit" disabled={processing} className="min-w-[80px]">
          {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ask"}
        </Button>
      </form>
    </div>
  );
}
