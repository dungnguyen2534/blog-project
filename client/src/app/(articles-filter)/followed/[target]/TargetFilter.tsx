"use client";

import React from "react";
import Link from "next/link";
import { revalidateTagData } from "@/lib/revalidate";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePathname } from "next/navigation";

interface TargetFilterProps {
  defaultValue: "Users" | "Tags" | "All";
  className?: string;
  children: React.ReactNode;
}

export default function TargetFilter({
  children,
  defaultValue,
  className,
}: TargetFilterProps) {
  const pathname = usePathname();
  const activeClass = "text-black dark:text-white underline";
  return (
    <Tabs
      defaultValue={defaultValue}
      className={`secondary-container -mt-[0.2rem] md:-mt-[0.4rem]  w-full !bg-transparent ${className}`}>
      <div className="">
        <TabsList className="rounded-none md:rounded-b-md mb-1 md:mb-2 grid md:hidden grid-cols-3 w-full bg-white dark:bg-neutral-900 [&>a[data-state='active']]:ring-1 [&>a[data-state='active']]:ring-neutral-200 [&>a[data-state='active']]:dark:ring-0 [&>a[data-state='active']]:text-black [&>a[data-state='active']]:dark:text-neutral-100 ring-1 ring-[#f4f4f4] dark:ring-neutral-950">
          <TabsTrigger
            asChild
            value="All"
            onClick={() => revalidateTagData("articles")}>
            <Link replace={true} href={"/followed/all"}>
              All
            </Link>
          </TabsTrigger>
          <TabsTrigger asChild value="Users">
            <Link replace={true} href={"/followed/users"}>
              Users
            </Link>
          </TabsTrigger>
          <TabsTrigger
            onClick={() => revalidateTagData("articles")}
            asChild
            value="Tags">
            <Link replace={true} href={"/followed/tags"}>
              Tags
            </Link>
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="hidden md:block mb-2 mt-[0.9rem]">
        <div className="flex items-center">
          <h1 className="text-2xl font-semibold">Followed</h1>

          <div className="ml-auto flex gap-4 text-neutral-500 hover:[&>*]:text-black dark:hover:[&>*]:text-white">
            <Link
              className={pathname === "/followed/all" ? activeClass : ""}
              href="/followed/all">
              All
            </Link>
            <Link
              className={pathname === "/followed/users" ? activeClass : ""}
              href="/followed/users">
              Users
            </Link>
            <Link
              className={pathname === "/followed/tags" ? activeClass : ""}
              href="/followed/tags">
              Tags
            </Link>
          </div>
        </div>
        <hr />
      </div>

      {children}
    </Tabs>
  );
}
