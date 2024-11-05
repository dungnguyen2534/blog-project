"use client";

import React, { useMemo } from "react";
import { TiArrowLeft } from "react-icons/ti";
import { useRouter } from "next/navigation";
import useNavigation from "@/hooks/useNavigation";
import nProgress from "nprogress";
import useArticlesLoader from "@/hooks/useArticlesLoader";

interface PreviousUrlButtonProps {
  className?: string;
}

export default function PreviousUrlButton({
  className,
}: PreviousUrlButtonProps) {
  const router = useRouter();
  const { prevUrl, pathname } = useNavigation();
  const { handleArticleListChange } = useArticlesLoader();

  const backHomeCondition = useMemo(
    () =>
      prevUrl === "/articles/create-article" ||
      prevUrl?.startsWith("/articles/update-article") ||
      prevUrl?.startsWith("/auth"),
    [prevUrl]
  );

  const changingArticleList = useMemo(
    () =>
      pathname?.startsWith("/users") ||
      pathname?.startsWith("/bookmarks") ||
      pathname?.startsWith("/tags"),
    [pathname]
  );

  // have to use nProgress here because next top loader doesn't work with router functions
  return (
    <div
      className={`cursor-pointer ${className}`}
      onClick={() => {
        if (backHomeCondition) {
          nProgress.start();
          router.push("/");
        } else if (changingArticleList) {
          nProgress.start();
          router.push(prevUrl ? prevUrl : "/");
          handleArticleListChange(prevUrl ? prevUrl : "/");
        } else if (!prevUrl) {
          nProgress.start();
          router.push("/");
        } else {
          nProgress.start();
          router.push(prevUrl);
        }
      }}>
      <span className="flex gap-1 items-center text-xs font-bold italic">
        <TiArrowLeft size={22} className="mb-[0.1rem]" />
        BACK
      </span>
    </div>
  );
}
