"use client";

import Link from "next/link";
import { ModeToggle } from "../ui/mode-toggle";
import useAuth from "@/hooks/useAuth";
import SignedOutView from "./SignedOutView";
import SignedInView from "./SignedInView";
import { RxHamburgerMenu } from "react-icons/rx";
import { FaTerminal } from "react-icons/fa";
import useNavigation from "@/hooks/useNavigation";
import PreviousUrlButton from "../PreviousUrlButton";
import { Skeleton } from "../ui/skeleton";
import useArticlesLoader from "@/hooks/useArticlesLoader";
import SearchButton from "./SearchButton";
import { Separator } from "@radix-ui/react-dropdown-menu";

export default function Navbar() {
  const { user, isLoadingUser, mutateUser } = useAuth();
  const { pathname, setPrevScrollPosition } = useNavigation();
  const { handleArticleListChange } = useArticlesLoader();

  let callToActions = (
    <div className="hidden md:flex items-center gap-3">
      <Skeleton className="hidden sm:block h-10 w-[7.8275rem]" />
      <Skeleton className="h-12 w-12  sm:h-[2.4rem] sm:w-[2.4rem] rounded-full" />
    </div>
  );
  if (user) {
    callToActions = <SignedInView user={user} mutateUser={mutateUser} />;
  } else if (!user && !isLoadingUser) {
    callToActions = <SignedOutView />;
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
    <header className="overflow-hidden h-16 z-50 flex items-center fixed w-[calc(100vw-1px)] top-0 main-color ring-1 ring-[#e7e7e7] dark:ring-neutral-800">
      <div className="container px-2 md:px-4 flex items-center relative">
        <LogoTag
          href="/"
          onClick={() => {
            handleArticleListChange("/");
            setPrevScrollPosition(0);
          }}
          className="absolute top-1/2 transform -translate-y-1/2 text-xl font-bold flex items-center">
          <FaTerminal size={26} className="" />
          <span className="ml-1 text-xl font-extrabold">DEVFLOW</span>
        </LogoTag>
        <span className="absolute left-44 rotate-[18deg] w-[1px] h-[300%] bg-[#e7e7e7] dark:bg-neutral-800"></span>
        <div className="hidden md:flex ml-[11.35rem] items-center gap-2 transition-all text-sm text-neutral-600 dark:text-neutral-400 [&>*]:p-2 hover:[&>*]:text-black dark:hover:[&>*]:text-white">
          {showPrevUrlCondition ? (
            <PreviousUrlButton className="mt-1 -ml-3" />
          ) : (
            <>
              <Link
                className={pathname === "/" ? activeClass : ""}
                href="/"
                onClick={() => handleArticleListChange("/")}>
                Latest
              </Link>
              <Link
                className={pathname.startsWith("/top") ? activeClass : ""}
                href="/top/week"
                onClick={() => handleArticleListChange("/top/week")}>
                Top
              </Link>
              <Link
                className={pathname.startsWith("/followed") ? activeClass : ""}
                href="/followed/all"
                onClick={() => handleArticleListChange("/followed/all")}>
                Followed
              </Link>
            </>
          )}
        </div>

        <div className="flex justify-center items-center gap-3 ml-auto">
          {pathname === "/onboarding" && <ModeToggle className="md:hidden" />}

          <div className="flex gap-1">
            <SearchButton className={isLoadingUser ? "hidden md:flex" : ""} />
            <ModeToggle className="hidden md:flex" />
          </div>

          <Separator className="block w-[1px] h-6 bg-neutral-200 dark:bg-neutral-800 mr-1 md:mr-2" />

          <RxHamburgerMenu
            size={36}
            className={`md:hidden mx-2 text-muted-foreground ${
              isLoadingUser ? "" : "hidden"
            }`}
          />
          {callToActions}
        </div>
      </div>
    </header>
  );
}
