import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { UserButton } from "@clerk/nextjs";
import { PageHeader } from "./PageHeader";

interface Props {
  isAuth: boolean;
}

export default function Header({ isAuth }: Props) {
  return (
    <div className="container flex items-start justify-between">
      <PageHeader
        heading="Chat with PDF"
        subheading="Upload a PDF file and ask any questions about it."
      />
      {isAuth ? (
        <UserButton afterSignOutUrl="/" />
      ) : (
        <div className="flex gap-4">
          <Link href="/sign-in">
            <Button>Sign in</Button>
          </Link>

          <Link href="/sign-up">
            <Button>Sign up</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
