"use client";

import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ModeToggle } from "../ui/mode-toggle";
import useAuth from "@/hooks/useAuth";
import { IoMdCodeDownload } from "react-icons/io";
import SignedOutView from "./SignedOutView";
import SignedInView from "./SignedInView";
import { usePathname } from "next/navigation";
import revalidateCachedData from "@/lib/revalidate";

export default function Navbar() {
  const { user, mutateUser, isValidatingUser } = useAuth();
  const pathname = usePathname();

  let callToActions;
  if (isValidatingUser) {
    callToActions = (
      <div className="flex items-center gap-2">
        <Skeleton className="hidden sm:block h-10 w-[117px]" />
        <Skeleton className="w-[2.4rem] h-[2.4rem] rounded-full" />
      </div>
    );
  } else if (user) {
    callToActions = <SignedInView user={user} mutateUser={mutateUser} />;
  } else {
    callToActions = <SignedOutView />;
  }

  const LogoTag = pathname === "/onboarding" ? "div" : Link;

  return (
    <header className="z-50 sticky top-0 secondary-color border-b-[1px] pb-2 pt-3 sm:py-3 shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-900">
      <div className="container px-2 sm:px-8  flex items-center relative">
        <LogoTag
          href="/"
          onClick={() => revalidateCachedData("/")}
          className="absolute top-1/2 transform -translate-y-1/2 text-xl font-semibold flex items-center">
          <IoMdCodeDownload size={50} className="-ml-[0.175rem]" />
          <span className="ml-1 text-2xl">Devflow</span>
        </LogoTag>
        <div className="flex justify-center items-center gap-3 ml-auto">
          {pathname === "/onboarding" && <ModeToggle className="sm:hidden" />}
          <ModeToggle className="hidden sm:flex" />
          {callToActions}
        </div>
      </div>
    </header>
  );
}
