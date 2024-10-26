"use client";

import PreviousUrlButton from "@/components/PreviousUrlButton";
import { usePathname } from "next/navigation";
import React from "react";

export default function NavigateBackButton() {
  const pathname = usePathname();
  const showPrevUrlCondition = [
    "/articles",
    "/users",
    "/bookmarks",
    "/tags",
  ].some((path) => pathname.startsWith(path));

  return showPrevUrlCondition ? (
    <div className="-ml-1 block md:hidden text-sm text-neutral-600 dark:text-neutral-400  hover:[&>*]:text-black dark:hover:[&>*]:text-white">
      <PreviousUrlButton />
    </div>
  ) : null;
}
