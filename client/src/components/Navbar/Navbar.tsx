"use client";

import Link from "next/link";
import { ModeToggle } from "../ui/mode-toggle";
import useAuth from "@/hooks/useAuth";
import SignedOutView from "./SignedOutView";
import SignedInView from "./SignedInView";
import { revalidateTagData } from "@/lib/revalidate";
import { User } from "@/validation/schema/user";
import { useState } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { SiCodersrank } from "react-icons/si";
import useNavigation from "@/hooks/useNavigation";
import PreviousUrlButton from "../PreviousUrlButton";


interface Navbar {
  authenticatedUser?: User;
}

export default function Navbar({ authenticatedUser }: Navbar) {
  const [authenticatedUserSSR, setAuthenticatedUserSSR] = useState<
    User | undefined
  >(authenticatedUser);

  const { user, isLoadingUser, mutateUser } = useAuth();
  const { pathname } = useNavigation();
  let callToActions = <SignedOutView />;
  if (user || authenticatedUserSSR) {
    callToActions = (
      <SignedInView
        user={user || authenticatedUserSSR}
        setAuthenticatedUserSSR={setAuthenticatedUserSSR}
        mutateUser={mutateUser}
      />
    );
  }
  const LogoTag = pathname === "/onboarding" ? "div" : Link;

  if (pathname === "/auth") return null;
  const activeClass = "text-black dark:text-white underline";
  const showPrevUrlCondition = [
    "/articles",
    "/users",
    "/bookmarks",
    "/tags",
  ].some((path) => pathname.startsWith(path));

  return (
    <header className="overflow-hidden h-16 z-50 flex items-center fixed w-[calc(100vw-1px)] top-0 secondary-color ring-1 ring-[#e7e7e7] dark:ring-neutral-800">
      <div className="container px-2 md:px-4 flex items-center relative">
        <LogoTag
          href="/"
          onClick={() => revalidateTagData("articles")}
          className="absolute top-1/2 transform -translate-y-1/2 text-xl font-bold flex items-center">
          <SiCodersrank size={28} className="mb-[0.2rem]" />
          <span className="ml-1 text-xl font-extrabold italic">DEVFLOW</span>
        </LogoTag>
        <span className="absolute left-48 rotate-[25deg] w-[1px] h-[300%] bg-[#e7e7e7] dark:bg-neutral-800"></span>
        <div className="hidden md:flex ml-52 items-center gap-2 transition-all text-sm text-neutral-600 dark:text-neutral-400 [&>*]:p-2 hover:[&>*]:text-black dark:hover:[&>*]:text-white">
          {showPrevUrlCondition ? (
            <PreviousUrlButton />
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
