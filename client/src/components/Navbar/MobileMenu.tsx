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

interface MobileMenuProps {
  username?: string;
  setOpenDialog?: React.Dispatch<SetStateAction<boolean>>;
}

export default function MobileMenu({
  username,
  setOpenDialog,
}: MobileMenuProps) {
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
      <SheetTrigger className="relative md:hidden sm:my-0 p-1 px-2">
        <RxHamburgerMenu
          size={40}
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
            className="!flex -mt-3  px-1 py-6 items-center hover:be-neutral-100 dark:hover:bg-neutral-900"
            onClick={() => setOpenMenu(false)}>
            <AiOutlineClose size={43} />
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
                onClick={() => setOpenMenu(false)}
                href={`/users/${username}`}>
                Personal Profile
              </Link>
              <Link onClick={() => setOpenMenu(false)} href="/bookmarks">
                Bookmarks
              </Link>
              <Link
                className=""
                href=""
                onClick={() => setOpenDialog && setOpenDialog(true)}>
                Sign out
              </Link>
            </>
          ) : (
            <Link className="" href="/auth?sign-in">
              Sign in
            </Link>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
