import ChatComponent from "@/components/shared/ChatComponent";
import ChatSideBar from "@/components/shared/ChatSideBar";
import { PDFViewer } from "@/components/shared/PDFViewer";
// import PDFViewer from "@/components/shared/PDFViewer";
import React from "react";

export default function page({ params }: { params: { chatId: string } }) {
  console.log(params);

  return (
    <div className=" max-h-screen grid grid-cols-12">
      {/* <div className=" col-span-2"> */}
      {/* chat sidebar */}
      <div className="col-span-2">
        <ChatSideBar />
      </div>
      {/* pdf viewer */}
      <div className="col-span-5">
        <PDFViewer />
      </div>
      {/* chat component */}
      <div className="col-span-5">
        <ChatComponent chatId={params.chatId} progress={1} />
      </div>
      {/* </div> */}
    </div>
  );
}
