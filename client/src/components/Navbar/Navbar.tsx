"use client";

import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ModeToggle } from "../ui/mode-toggle";
import useAuth from "@/hooks/useAuth";
import { SiStoryblok } from "react-icons/si";
import SignedOutView from "./SignedOutView";
import SignedInView from "./SignedInView";

export default function Navbar() {
  const { user, mutateUser, isValidatingUser } = useAuth();

  // skeleton to prevent SignOutView showing up when user is still being validated(when refreshing the page)
  let callToActions;
  if (isValidatingUser) {
    callToActions = (
      <div className="flex items-center gap-2">
        <Skeleton className="hidden sm:block h-10 w-[117px]" />
        <Skeleton className="h-12 w-12  sm:h-10 sm:w-10 rounded-md" />
      </div>
    );
  } else if (user) {
    callToActions = <SignedInView user={user} mutateUser={mutateUser} />;
  } else {
    callToActions = <SignedOutView />;
  }

  return (
    <header className="z-50 sticky top-0 secondary-color border-b-[1px] pb-1 pt-2 sm:py-3 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-900">
      <div className="container px-2 sm:px-8  flex items-center relative">
        <Link
          href={"/"}
          className="absolute top-1/2 transform -translate-y-1/2 text-xl font-black flex items-center">
          <SiStoryblok size={37} />
          <span className="-ml-[2px] text-4xl">LOG</span>
        </Link>

        <div className="flex justify-center items-center gap-3 ml-auto">
          <ModeToggle className="hidden sm:flex" />
          {callToActions}
        </div>
      </div>
    </header>
  );
}
