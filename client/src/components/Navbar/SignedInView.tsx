"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import UserAvatar from "../UserAvatar";
import UserAPI from "@/api/user";
import { User } from "@/validation/schema/user";
import { usePathname } from "next/navigation";
import { useToast } from "../ui/use-toast";
import MobileDropdownContent from "./MobileDropdownContent";
import PostsAPI from "@/api/post";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import LoadingButton from "../LoadingButton";
import { DialogHeader } from "../ui/dialog";
import { useState } from "react";
import { Skeleton } from "../ui/skeleton";

interface SignedInViewProps {
  user: User;
  mutateUser: (user: User | null) => void;
}

export default function SignedInView({ user, mutateUser }: SignedInViewProps) {
  const pathname = usePathname();
  const { toast } = useToast();

  const [show, setShow] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignout() {
    setIsSigningOut(true);

    try {
      await PostsAPI.deleteUnusedImages();
      await UserAPI.signout();
      mutateUser(null);
    } catch (error) {
      setIsSigningOut(false);
      toast({
        title: "Error",
        description: "Failed to sign out",
      });
    }
  }

  return (
    <>
      {user.username &&
        !(pathname === "/posts/create-post" || pathname === "/onboarding") && (
          <Button
            asChild
            variant="outline"
            className="hidden sm:block border-2">
            <Link href="/posts/create-post">Create post</Link>
          </Button>
        )}
      {user.username && !(pathname === "/onboarding") && (
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger>
            <UserAvatar
              username={user.username}
              profilePicUrl={user.profilePicPath}
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[30vh] sm:w-auto">
            <DropdownMenuItem className="text-lg sm:text-base" asChild>
              <Link href={"/users/" + user.username}>@{user.username}</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <MobileDropdownContent />
            <DropdownMenuItem
              onClick={handleSignout}
              className="text-lg sm:text-base">
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {!user.username && pathname === "/onboarding" && (
        <Dialog open={show} onOpenChange={setShow}>
          <DialogTrigger asChild>
            <Button variant="outline">Sign out</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure to sign out?</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => setShow(false)}>Turn back</Button>
              <LoadingButton
                loading={isSigningOut}
                text="Sure, sign out"
                loadingText="Signing out..."
                onClick={handleSignout}
                className="bg-red-600 dark:hover:bg-red-700 text-white"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
      {!user.username && pathname !== "/onboarding" && (
        <div className="flex items-center gap-2">
          <Skeleton className="hidden sm:block h-10 w-[117px]" />
          <Skeleton className="h-12 w-12  sm:h-10 sm:w-10 rounded-full" />
        </div>
      )}
    </>
  );
}
