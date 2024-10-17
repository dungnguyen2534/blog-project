"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import Link from "next/link";

import revalidateCachedData from "@/lib/revalidate";
import { usePathname } from "next/navigation";

interface PostListTabsProps {
  defaultValue: "Latest" | "Top" | "Followed";
  className?: string;
  children: React.ReactNode;
}

export default function PostListTabs({
  children,
  defaultValue,
  className,
}: PostListTabsProps) {
  const pathname = usePathname();

  return (
    <Tabs
      defaultValue={defaultValue}
      className={`secondary-container -mt-[2px] md:mt-0 w-full !bg-transparent ${className}`}>
      <TabsList
        className={`rounded-none ${
          pathname.startsWith("/top") || pathname.startsWith("/followed")
            ? "md:rounded-t-md"
            : "rounded-none md:rounded-md"
        } mb-1 md:mb-2 grid grid-cols-3 w-full ring-1 ring-[#f1f1f1] dark:ring-neutral-950 bg-white dark:bg-neutral-900  [&>a[data-state='active']]:ring-1 [&>a[data-state='active']]:ring-neutral-200 [&>a[data-state='active']]:dark:ring-0 [&>a[data-state='active']]:text-black [&>a[data-state='active']]:dark:text-neutral-100`}>
        <TabsTrigger
          onClick={() => revalidateCachedData("/")}
          asChild
          value="Latest">
          <Link replace={true} href={"/"}>
            Latest
          </Link>
        </TabsTrigger>
        <TabsTrigger
          onClick={() => revalidateCachedData("/top/week")}
          asChild
          value="Top">
          <Link replace={true} href={"/top/week"}>
            Top
          </Link>
        </TabsTrigger>
        <TabsTrigger
          onClick={() => revalidateCachedData("/followed")}
          asChild
          value="Followed">
          <Link replace={true} href={"/followed/all"}>
            Followed
          </Link>
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
