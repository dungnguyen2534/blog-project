"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ModeToggle } from "./ui/mode-toggle";
import { Button } from "./ui/button";
import useAuthDialogs from "@/hooks/useAuthDialogs";
import useAuth from "@/hooks/useAuth";
import UserAPI from "@/api/user";
import { FaUserCog } from "react-icons/fa";
import { usePathname } from "next/navigation";
import { useToast } from "./ui/use-toast";

export default function Navbar() {
  const { user, isValidatingUser } = useAuth();

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
    callToActions = <SignedInView username={user.username} />;
  } else {
    callToActions = <SignedOutView />;
  }

  return (
    <header className="sticky top-0 secondary-color border-b-[1px] py-3 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-900">
      <div className="container flex relative">
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

function SignedInView({ username }: { username: string }) {
  const { mutateUser } = useAuth();
  const { toast } = useToast();
  const pathname = usePathname();

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
      {!(pathname === "/create-post") && (
        <Button asChild variant="outline" className="border-2">
          <Link href="/create-post">Create post</Link>
        </Button>
      )}
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger>
          <Avatar>
            <AvatarImage src="" alt={`${username} avatar`} />
            <AvatarFallback>
              <FaUserCog
                size={26}
                className="ml-1 text-neutral-700 dark:text-neutral-200"
              />
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>{`@${username}`}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem onClick={handleSignout}>Sign out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
