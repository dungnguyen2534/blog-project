"use client";

import React from "react";
import Link from "next/link";

import revalidateCachedData from "@/lib/revalidate";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TimeSpanFilterProps {
  defaultValue: "Week" | "Month" | "Year" | "Infinity";
  className?: string;
  children: React.ReactNode;
}

export default function TimeSpanFilter({
  children,
  defaultValue,
  className,
}: TimeSpanFilterProps) {
  return (
    <Tabs
      defaultValue={defaultValue}
      className={`secondary-container -mt-[0.2rem] md:-mt-[0.4rem]  w-full !bg-transparent ${className}`}>
      <div className="">
        <TabsList className="rounded-none md:rounded-b-md mb-1 md:mb-2 flex w-full bg-white dark:bg-neutral-900 [&>*]:flex-grow [&>a[data-state='active']]:ring-1 [&>a[data-state='active']]:ring-neutral-200 [&>a[data-state='active']]:dark:ring-0 [&>a[data-state='active']]:text-black [&>a[data-state='active']]:dark:text-neutral-100 ring-1 ring-[#f1f1f1] dark:ring-neutral-950">
          <TabsTrigger
            onClick={() => revalidateCachedData("/top/week")}
            asChild
            value="Week">
            <Link replace={true} href={"/top/week"}>
              Week
            </Link>
          </TabsTrigger>
          <TabsTrigger
            onClick={() => revalidateCachedData("/top/month")}
            asChild
            value="Month">
            <Link replace={true} href={"/top/month"}>
              Month
            </Link>
          </TabsTrigger>
          <TabsTrigger
            onClick={() => revalidateCachedData("/top/year")}
            asChild
            value="Year">
            <Link replace={true} href={"/top/year"}>
              Year
            </Link>
          </TabsTrigger>
          <TabsTrigger
            onClick={() => revalidateCachedData("/top/infinity")}
            asChild
            value="Infinity">
            <Link replace={true} href={"/top/infinity"}>
              Infinity
            </Link>
          </TabsTrigger>
        </TabsList>
      </div>

      {children}
    </Tabs>
  );
}
