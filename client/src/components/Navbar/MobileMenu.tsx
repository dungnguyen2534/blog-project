"use client";

import React, { SetStateAction, useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { RxHamburgerMenu } from "react-icons/rx";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "../ui/button";
import { AiOutlineClose } from "react-icons/ai";
import useAuth from "@/hooks/useAuth";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun } from "lucide-react";
import SearchButton from "./SearchButton";
import useArticlesLoader from "@/hooks/useArticlesLoader";

interface MobileMenuProps {
  username?: string;
  setOpenDialog?: React.Dispatch<SetStateAction<boolean>>;
}

export default function MobileMenu({
  username,
  setOpenDialog,
}: MobileMenuProps) {
  const { handleArticleListChange } = useArticlesLoader();
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const { user, isLoadingUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [openMenu, setOpenMenu] = useState(false);

  const newTheme = theme === "light" ? "dark" : "light";
  const toggleTheme = () => {
    setTheme(newTheme);
  };

  return (
    <Sheet open={openMenu} onOpenChange={setOpenMenu}>
      <SheetTrigger
        className="relative md:hidden sm:my-0 p-1 px-2"
        aria-label="Open menu">
        <RxHamburgerMenu
          size={36}
          className={isLoadingUser ? "text-muted-foreground" : ""}
        />
      </SheetTrigger>

      <SheetContent className="[&>*]:w-full [&>button]:hidden flex flex-col items-end">
        <SheetHeader className="hidden">
          <SheetTitle></SheetTitle>
          <SheetDescription />
        </SheetHeader>
        <div className="flex justify-between">
          <div className="-mt-3 flex gap-3 items-center">
            {mounted && (
              <Switch
                checked={theme === "light"}
                onCheckedChange={toggleTheme}
              />
            )}

            <div>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 block transition-all dark:-rotate-90 dark:hidden" />
              <Moon className="h-[1.2rem] w-[1.2rem] rotate-90 hidden transition-all dark:rotate-0 dark:block" />
            </div>
          </div>

          <Button
            variant="ghost"
            className="!flex -mt-3 -mr-2  px-3 py-7 items-center hover:be-neutral-100 dark:hover:bg-neutral-900"
            onClick={() => setOpenMenu(false)}>
            <AiOutlineClose size={36} />
          </Button>
        </div>
        <div className="flex flex-col items-end  [&>a]:p-3 [&>a]:rounded-md [&>a:hover]:bg-neutral-100 [&>a:hover]:dark:bg-neutral-900 [&>*]:w-full [&>*]:transition-colors [&>*]:text-end">
          {user ? (
            <>
              <Link
                onClick={() => setOpenMenu(false)}
                href="/articles/create-article">
                Create article
              </Link>
              <hr className="my-5" />
              <Link
                onClick={() => {
                  setOpenMenu(false);
                  handleArticleListChange("/users/" + username);
                }}
                href={`/users/${username}`}>
                Personal Profile
              </Link>
              <Link
                onClick={() => {
                  setOpenMenu(false);
                  handleArticleListChange("/bookmarks");
                }}
                href="/bookmarks">
                Bookmarks
              </Link>

              <span
                onClick={() => setOpenDialog && setOpenDialog(true)}
                className="cursor-pointer p-3 rounded-md hover:bg-neutral-100 hover:dark:bg-neutral-900 w-full transition-colors text-end">
                Sign out
              </span>
            </>
          ) : (
            <>
              <Link className="" href="/auth?sign-in">
                Sign in
              </Link>
              <SearchButton asChild>
                <span className="cursor-pointer p-3 rounded-md hover:bg-neutral-100 hover:dark:bg-neutral-900 w-full transition-colors text-end">
                  Search
                </span>
              </SearchButton>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
