"use client";

import React from "react";
import Link from "next/link";
import revalidateCachedData from "@/lib/revalidate";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  return (
    <Tabs
      defaultValue={defaultValue}
      className={`secondary-container -mt-[0.2rem] md:-mt-[0.4rem]  w-full !bg-transparent ${className}`}>
      <div className="">
        <TabsList className="rounded-none md:rounded-b-md mb-1 md:mb-2 grid grid-cols-3 w-full bg-white dark:bg-neutral-900 [&>a[data-state='active']]:ring-1 [&>a[data-state='active']]:ring-neutral-200 [&>a[data-state='active']]:dark:ring-0 [&>a[data-state='active']]:text-black [&>a[data-state='active']]:dark:text-neutral-100 ring-1 ring-[#f1f1f1] dark:ring-neutral-950">
          <TabsTrigger asChild value="All">
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
            onClick={() => revalidateCachedData("/followed/tags")}
            asChild
            value="Tags">
            <Link replace={true} href={"/followed/tags"}>
              Tags
            </Link>
          </TabsTrigger>
        </TabsList>
      </div>

      {children}
    </Tabs>
  );
}
