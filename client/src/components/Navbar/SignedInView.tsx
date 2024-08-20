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
import env from "@/validation/env-validation";

interface SignedInViewProps {
  user: User;
  mutateUser: (user: User | undefined) => void;
}

export default function SignedInView({ user, mutateUser }: SignedInViewProps) {
  const pathname = usePathname();
  const { toast } = useToast();

  async function handleSignout() {
    try {
      await UserAPI.signout();
      mutateUser(undefined);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
      });
    }
  }

  return (
    <>
      {!(pathname === "/posts/create-post") && (
        <Button asChild variant="outline" className="hidden sm:block border-2">
          <Link href="/posts/create-post">Create post</Link>
        </Button>
      )}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger>
          <UserAvatar
            username={user.username}
            profilePicUrl={env.NEXT_PUBLIC_SERVER_URL + user.profilePicPath}
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
    </>
  );
}
