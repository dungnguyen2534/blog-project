"use client";

import React from "react";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import Link from "next/link";
import useAuth from "@/hooks/useAuth";
import revalidateCachedData from "@/lib/revalidate";

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
  const { user } = useAuth();

  return (
    <Tabs
      defaultValue={defaultValue}
      className={`secondary-container mb-2 w-full !bg-transparent ${className}`}>
      <TabsList className="mb-2 flex w-full shadow-sm bg-white dark:bg-neutral-900 [&>*]:flex-grow [&>a[data-state='active']]:ring-1 [&>a[data-state='active']]:ring-neutral-200 [&>a[data-state='active']]:dark:ring-0 [&>a[data-state='active']]:text-black [&>a[data-state='active']]:dark:text-neutral-100">
        <TabsTrigger
          onClick={() => revalidateCachedData("/")}
          asChild
          value="Latest">
          <Link replace={true} href={"/"}>
            Latest
          </Link>
        </TabsTrigger>
        <TabsTrigger
          onClick={() => revalidateCachedData("/top")}
          asChild
          value="Top">
          <Link replace={true} href={"/top"}>
            Top
          </Link>
        </TabsTrigger>
        {user && user.totalFollowing > 0 && (
          <TabsTrigger
            onClick={() => revalidateCachedData("/followed")}
            asChild
            value="Followed">
            <Link replace={true} href={"/followed"}>
              Followed
            </Link>
          </TabsTrigger>
        )}
      </TabsList>
      {children}
    </Tabs>
  );
}
