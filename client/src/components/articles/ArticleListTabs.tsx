"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import Link from "next/link";
import { revalidateTagData } from "@/lib/revalidate";
import { usePathname } from "next/navigation";
import useArticlesLoader from "@/hooks/useArticlesLoader";
import { Button } from "../ui/button";

interface ArticleListTabsProps {
  defaultValue: "Latest" | "Top" | "Followed";
  className?: string;
  children: React.ReactNode;
}

export default function ArticleListTabs({
  children,
  defaultValue,
  className,
}: ArticleListTabsProps) {
  const pathname = usePathname();

  const { handleArticleListChange } = useArticlesLoader();

  return (
    <Tabs
      defaultValue={defaultValue}
      className={`secondary-container  md:mt-0 w-full !bg-transparent`}>
      <TabsList
        className={`md:hidden rounded-none ${
          pathname.startsWith("/top") || pathname.startsWith("/followed")
            ? "md:rounded-t-md"
            : "rounded-none md:rounded-md"
        } mb-1 md:mb-2 grid grid-cols-3 w-full bg-white dark:bg-neutral-950  [&>a[data-state='active']]:ring-1 [&>a[data-state='active']]:ring-neutral-200 [&>a[data-state='active']]:dark:ring-[#222] [&>a[data-state='active']]:text-black [&>a[data-state='active']]:dark:text-neutral-100 ${className}`}>
        <TabsTrigger asChild value="Latest">
          <Link href={"/"} onClick={() => handleArticleListChange("/")}>
            Latest
          </Link>
        </TabsTrigger>
        <TabsTrigger asChild value="Top">
          <Link
            href={"/top/week"}
            onClick={() => handleArticleListChange("/top/week")}>
            Top
          </Link>
        </TabsTrigger>
        <TabsTrigger asChild value="Followed">
          <Link
            href={"/followed/all"}
            onClick={() => handleArticleListChange("/followed/all")}>
            Followed
          </Link>
        </TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
}
