import { Metadata } from "next";
import { ChatPDF } from "./ChatPDF";
import { PageHeader } from "@/components/shared/PageHeader";
import { UserButton, auth } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, LogIn } from "lucide-react";
import Header from "@/components/shared/Header";
import FileUpload from "@/components/shared/FileUpload";

export const metadata: Metadata = {
  title: "Chat with any PDF",
  description: "Upload a PDF file and ask any questions about it.",
};

export default async function ChatWithAnyPDF() {
  const { userId } = await auth();
  const isAuth = !!userId;

  return (
    <>
      <Header isAuth={isAuth} />

      <div className="">
        <div className=" mt-4 ">
          {isAuth ? (
            // <FileUpload userId={userId} />
            <ChatPDF />
          ) : (
            <Link href="/sign-in">
              <Button>
                Login to get Started!
                <LogIn className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* </div> */}

      {/* <div className="w-screen min-h-screen bg-gradient-to-r from-rose-100 to-teal-100">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="flex flex-col items-center text-center">
            <div className="flex items-center">
              <h1 className="mr-3 text-5xl font-semibold">Chat with PDF</h1>
              <UserButton afterSignOutUrl="/" />
            </div>

            <div className="flex mt-2">
              {isAuth && (
                <Link href={`/chat`}>
                  <Button>
                    Go to Chats <ArrowRight className="ml-2" />
                  </Button>
                </Link>
              )}
            </div>

            <p className="max-w-xl mt-1 text-lg text-slate-600">
              Join millions of students, researchers and professinals to
              instantly anwer questions and understand research with AI
            </p>

            <div className="w-full mt-4">
              {isAuth ? (
                // <FileUpload />
                "FileUpload"
              ) : (
                <Link href="/sign-in">
                  <Button>
                    Login to get Started!
                    <LogIn className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div> */}
    </>
  );
}
