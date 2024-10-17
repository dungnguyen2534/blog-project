"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import Link from "next/link";

interface SignInDialogProps {
  show: boolean;
  setShow: (show: boolean) => void;
}

export default function SignInDialog({ show, setShow }: SignInDialogProps) {
  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="border-0 sm:border-[1px] rounded-md w-dvw h-dvh sm:w-96 sm:h-auto py-5 px-auto overflow-auto flex flex-col mb:justify-center">
        <DialogHeader>
          <DialogTitle>Sign in required</DialogTitle>
          <DialogDescription>
            Sign in or sign up to perform this action
          </DialogDescription>
        </DialogHeader>
        <div className="w-full">
          <Button asChild className="w-full" onClick={() => setShow(false)}>
            <Link href="/auth?signup">Sign up</Link>
          </Button>
          <Button
            asChild
            className="w-full mt-2"
            variant="secondary"
            onClick={() => setShow(false)}>
            <Link href="/auth?signin">Sign in</Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
