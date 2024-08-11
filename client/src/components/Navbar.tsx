"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ModeToggle } from "./ui/mode-toggle";
import { Button } from "./ui/button";
import useAuthDialogs from "@/hooks/useAuthDialogs";
import useAuth from "@/hooks/useAuth";
import UserAPI from "@/api/user";
import { usePathname } from "next/navigation";
import { useToast } from "./ui/use-toast";
import UserAvatar from "./UserAvatar";
import { User } from "@/validation/schema/user";
import user from "@/api/user";

export default function Navbar() {
  const { user, mutateUser, isValidatingUser } = useAuth();

  // skeleton to prevent SignOutView showing up when user is still being validated(when refreshing the page)
  let callToActions;
  if (isValidatingUser) {
    callToActions = (
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-[117px]" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>
    );
  } else if (user) {
    callToActions = <SignedInView user={user} mutateUser={mutateUser} />;
  } else {
    callToActions = <SignedOutView />;
  }

  return (
    <header className="z-50 sticky top-0 secondary-color border-b-[1px] py-3 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-900">
      <div className="px-3 sm:container flex relative">
        <Link
          href={"/"}
          className="absolute top-1/2 transform -translate-y-1/2 text-xl font-black">
          BLOG-PROJECT
        </Link>

        <div className="flex justify-center items-center gap-3 ml-auto">
          <ModeToggle />
          {callToActions}
        </div>
      </div>
    </header>
  );
}

function SignedOutView({}) {
  const { showSignIn, showSignUp } = useAuthDialogs();

  return (
    <>
      <Button variant="link" onClick={showSignIn}>
        Sign in
      </Button>
      <Button variant="outline" onClick={showSignUp}>
        Create account
      </Button>
    </>
  );
}

interface SignedInViewProps {
  user: User;
  mutateUser: (user: User | undefined) => void;
}

function SignedInView({ user, mutateUser }: SignedInViewProps) {
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
        <Button asChild variant="outline" className="border-2">
          <Link href="/posts/create-post">Create post</Link>
        </Button>
      )}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger>
          <UserAvatar username={user.username} profilePicUrl="" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{`@${user.username}`}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href={"users/" + user.username}>Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignout}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
