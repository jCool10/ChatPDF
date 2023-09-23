"use client";

import { Chat } from "@/app/Chat";
import { Progress } from "@radix-ui/react-progress";
import { Bot } from "lucide-react";
import React, { useState } from "react";

interface Props {
  progress: number;
  chatId: string;
  // numPages: number;
}

export default function ChatComponent({ progress, chatId }: Props) {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [numPages, setNumPages] = useState(null);

  return (
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
          chatId={chatId}
          showPages={numPages != null && numPages > 1}
          onGoToPage={(newPage) => setPageNumber(newPage)}
        />
      )}
    </div>
  );
}
