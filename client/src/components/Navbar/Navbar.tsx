"use client";

import Link from "next/link";
import { ModeToggle } from "../ui/mode-toggle";
import useAuth from "@/hooks/useAuth";
import SignedOutView from "./SignedOutView";
import SignedInView from "./SignedInView";
import { usePathname } from "next/navigation";
import { revalidateTagData } from "@/lib/revalidate";
import { User } from "@/validation/schema/user";
import { useState } from "react";
import { Skeleton } from "../ui/skeleton";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoMdCodeDownload } from "react-icons/io";
import { HiOutlineArrowNarrowLeft } from "react-icons/hi";
import { PiHouseLineLight } from "react-icons/pi";
import { SiCodersrank } from "react-icons/si";

interface Navbar {
  authenticatedUser?: User;
}

export default function Navbar({ authenticatedUser }: Navbar) {
  const [authenticatedUserSSR, setAuthenticatedUserSSR] = useState<
    User | undefined
  >(authenticatedUser);

  const { user, isLoadingUser, mutateUser } = useAuth();
  const pathname = usePathname();

  let callToActions;
  if (user || authenticatedUserSSR) {
    callToActions = (
      <SignedInView
        user={user || authenticatedUserSSR}
        setAuthenticatedUserSSR={setAuthenticatedUserSSR}
        mutateUser={mutateUser}
      />
    );
  } else if (!authenticatedUserSSR && isLoadingUser) {
    callToActions = (
      <div className="hidden md:flex items-center gap-2">
        <Skeleton className="hidden md:block h-10 w-[117px]" />
        <Skeleton className="h-12 w-12  md:h-10 md:w-10 rounded-full" />
      </div>
    );
  } else {
    callToActions = <SignedOutView />;
  }

  const LogoTag = pathname === "/onboarding" ? "div" : Link;

  if (pathname === "/auth") return null;
  const activeClass = "text-black dark:text-white underline";

  return (
    <header className="overflow-hidden h-16 z-50 flex items-center fixed w-full top-0 secondary-color border-b-[1px] pb-1 pt-2 md:py-[0.35rem] ring-1 ring-neutral-200 dark:ring-neutral-900">
      <div className="container px-2 md:px-4  flex items-center relative">
        <LogoTag
          href="/"
          onClick={() => revalidateTagData("articles")}
          className="absolute top-1/2 transform -translate-y-1/2 text-xl font-bold flex items-center">
          <SiCodersrank size={32} className="mb-[0.2rem]" />
          <span className="ml-1 text-xl font-bold italic">DEVFLOW</span>
        </LogoTag>
        <span className="absolute left-48 rotate-[25deg] w-[1px] h-[150%] bg-neutral-200 dark:bg-neutral-700"></span>
        <div className="hidden md:flex ml-52 items-center gap-2 transition-all text-sm text-neutral-600 dark:text-neutral-400 [&>*]:p-2 hover:[&>*]:text-black dark:hover:[&>*]:text-white">
          {pathname.startsWith("/articles") ||
          pathname.startsWith("/users") ||
          pathname.startsWith("/bookmarks") ? (
            <Link href="/" onClick={() => revalidateTagData("articles")}>
              <span className="flex gap-1 items-center">
                <HiOutlineArrowNarrowLeft />
                <PiHouseLineLight size={20} />
              </span>
              Back to home
            </Link>
          ) : (
            <>
              <Link className={pathname === "/" ? activeClass : ""} href="/">
                Latest
              </Link>
              <Link
                className={pathname.startsWith("/top") ? activeClass : ""}
                href="/top/week">
                Top
              </Link>
              <Link
                className={pathname.startsWith("/followed") ? activeClass : ""}
                href="/followed/all">
                Followed
              </Link>
            </>
          )}
        </div>

        <div className="flex justify-center items-center gap-3 ml-auto">
          {pathname === "/onboarding" && <ModeToggle className="md:hidden" />}
          <ModeToggle className="hidden md:flex" />

          <RxHamburgerMenu
            size={40}
            className={`md:hidden mr-2 text-muted-foreground ${
              !authenticatedUser && isLoadingUser ? "" : "hidden"
            }`}
          />
          {callToActions}
        </div>
      </div>
    </header>
  );
}
