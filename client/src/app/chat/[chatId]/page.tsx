"use client";

import chatsApi from "@/apis/chats.api";
import ChatComponent from "@/components/shared/ChatComponent";
import ChatSideBar from "@/components/shared/ChatSideBar";
import { MainComponent } from "@/components/shared/MainComponent";
import { PDFViewer } from "@/components/shared/PDFViewer";
import { getS3Url } from "@/utils/aws";
import { auth, useAuth } from "@clerk/nextjs";
import { useMutation, useQuery } from "@tanstack/react-query";
import { redirect } from "next/navigation";
// import PDFViewer from "@/components/shared/PDFViewer";
import React from "react";

export default function page({ params }: { params: { chatId: string } }) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { userId } = useAuth();
  if (!userId) return redirect("/sign-in");
  const { chatId } = params;

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: ChatsData } = useQuery({
    queryKey: ["chats"],
    queryFn: () => chatsApi.getChats({ userId }),
  });

  console.log(ChatsData);

  // if (ChatsData) {
  //   const firstChat = ChatsData[0];
  // }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { data: ChatDetailData } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: () => chatsApi.getChatDetail(chatId),
  });

  return (
    <div className=" max-h-screen grid grid-cols-12">
      <div className="col-span-2">
        <ChatSideBar chats={ChatsData?.data.metadata.chats} />
      </div>

      <div className="col-span-10">
        <MainComponent
          chatDetailId={chatId}
          pdfUrl={getS3Url(ChatDetailData?.data.metadata.chat.fileKey)}
        />
      </div>
    </div>
  );
}
