"use client";

import Link from "next/link";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import UserAvatar from "../UserAvatar";
import UserAPI from "@/api/user";
import { User } from "@/validation/schema/user";
import { usePathname } from "next/navigation";
import { useToast } from "../ui/use-toast";
import PostsAPI from "@/api/post";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import LoadingButton from "../LoadingButton";
import { DialogHeader } from "../ui/dialog";
import { useState } from "react";
import { Skeleton } from "../ui/skeleton";
import MobileMenu from "./MobileMenu";

interface SignedInViewProps {
  user?: User;
  setAuthenticatedUserSSR: (user: User | undefined) => void;
  mutateUser: (user: User | null) => void;
}

export default function SignedInView({
  user,
  mutateUser,
  setAuthenticatedUserSSR,
}: SignedInViewProps) {
  const pathname = usePathname();
  const { toast } = useToast();

  const [openDialog, setOpenDialog] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignout() {
    setIsSigningOut(true);

    try {
      await PostsAPI.deleteUnusedImages();
      await UserAPI.signout();
      setAuthenticatedUserSSR(undefined);
      mutateUser(null);

      window.location.reload();
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
      {user?.username &&
        !(pathname === "/posts/create-post" || pathname === "/onboarding") && (
          <Button
            asChild
            variant="outline"
            className="hidden md:block border-2">
            <Link href="/posts/create-post">Create post</Link>
          </Button>
        )}

      <MobileMenu username={user?.username} setOpenDialog={setOpenDialog} />
      <div className="hidden md:block">
        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          {user?.username && !(pathname === "/onboarding") && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger aria-label="menu" className="mt-[0.32rem]">
                <UserAvatar
                  username={user?.username}
                  profilePicUrl={user?.profilePicPath}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[30vh] [&>*]:cursor-pointer text-base md:w-auto hidden md:block">
                <DropdownMenuItem className="text-base" asChild>
                  <Link
                    className="font-medium"
                    href={"/users/" + user?.username}>
                    @{user?.username}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-base" asChild>
                  <Link className="font-medium" href="/bookmarks">
                    Bookmarks
                  </Link>
                </DropdownMenuItem>
                <DialogTrigger asChild>
                  <DropdownMenuItem className="text-base">
                    Sign out
                  </DropdownMenuItem>
                </DialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <DialogContent>
            <DialogHeader aria-describedby="">
              <DialogTitle>Are you sure to sign out?</DialogTitle>
              <DialogDescription />
            </DialogHeader>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={() => setOpenDialog(false)}>Turn back</Button>
              <LoadingButton
                loading={isSigningOut}
                text="Sure, sign out"
                loadingText="Signing out..."
                onClick={handleSignout}
                className="bg-red-600 hover:!bg-red-700 text-white"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {!user?.username && pathname !== "/onboarding" && (
        <div className="flex items-center gap-2">
          <Skeleton className="hidden md:block h-10 w-[117px]" />
          <Skeleton className="h-12 w-12  md:h-10 md:w-10 rounded-full" />
        </div>
      )}
    </>
  );
}
