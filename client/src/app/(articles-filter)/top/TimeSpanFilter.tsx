"use client";

import React, { useTransition } from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { time } from "console";
import { usePathname } from "next/navigation";
import useArticlesLoader from "@/hooks/useArticlesLoader";

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
  const pathname = usePathname();
  const activeClass = "text-black dark:text-white underline";
  const { handleArticleListChange } = useArticlesLoader();

  return (
    <>
      <Tabs
        defaultValue={defaultValue}
        className={`secondary-container -mt-[0.2rem] dark:-mt-[0.1rem] md:-mt-[0.4rem]  w-full !bg-transparent ${className}`}>
        <div className="">
          <TabsList className="rounded-none md:rounded-b-md mb-1 md:mb-2 grid md:hidden grid-cols-4 w-full bg-white dark:bg-neutral-950 [&>a[data-state='active']]:ring-1 [&>a[data-state='active']]:ring-neutral-200 [&>a[data-state='active']]:dark:ring-[#222] [&>a[data-state='active']]:text-black [&>a[data-state='active']]:dark:text-neutral-100 ring-1 ring-[#f1f1f1] dark:ring-neutral-950">
            <TabsTrigger
              asChild
              value="Week"
              onClick={() => handleArticleListChange("/top/week")}>
              <Link replace href={"/top/week"}>
                Week
              </Link>
            </TabsTrigger>
            <TabsTrigger
              asChild
              value="Month"
              onClick={() => handleArticleListChange("/top/month")}>
              <Link replace href={"/top/month"}>
                Month
              </Link>
            </TabsTrigger>
            <TabsTrigger
              asChild
              value="Year"
              onClick={() => handleArticleListChange("/top/year")}>
              <Link replace href={"/top/year"}>
                Year
              </Link>
            </TabsTrigger>
            <TabsTrigger
              asChild
              value="Infinity"
              onClick={() => handleArticleListChange("/top/infinity")}>
              <Link replace href={"/top/infinity"}>
                Infinity
              </Link>
            </TabsTrigger>
          </TabsList>
        </div>
        <div className="hidden md:block mb-2 mt-[0.39rem]">
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold">Top articles</h1>

            <div className="ml-auto flex gap-4 text-neutral-500 hover:[&>*]:text-black dark:hover:[&>*]:text-white">
              <Link
                replace
                className={pathname === "/top/week" ? activeClass : ""}
                href="/top/week"
                onClick={() => handleArticleListChange("/top/week")}>
                Week
              </Link>
              <Link
                replace
                className={pathname === "/top/month" ? activeClass : ""}
                href="/top/month"
                onClick={() => handleArticleListChange("/top/month")}>
                Month
              </Link>
              <Link
                replace
                className={pathname === "/top/year" ? activeClass : ""}
                href="/top/year"
                onClick={() => handleArticleListChange("/top/year")}>
                Year
              </Link>
              <Link
                replace
                className={pathname === "/top/infinity" ? activeClass : ""}
                href="/top/infinity"
                onClick={() => handleArticleListChange("/top/infinity")}>
                Infinity
              </Link>
            </div>
          </div>
          <hr />
        </div>

        {children}
      </Tabs>
    </>
  );
}
