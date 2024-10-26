"use client";

import React from "react";
import { TiArrowLeft } from "react-icons/ti";
import { useRouter } from "next/navigation";
import useNavigation from "@/hooks/useNavigation";
import { revalidateTagData } from "@/lib/revalidate";
import nProgress from "nprogress";

export default function PreviousUrlButton() {
  const router = useRouter();
  const { prevUrl } = useNavigation();
  const backHomeCondition =
    prevUrl === "/articles/create-article" ||
    prevUrl?.startsWith("/articles/update-article") ||
    prevUrl?.startsWith("/auth");

  return (
    <div
      className="cursor-pointer"
      onClick={() => {
        if (backHomeCondition) {
          nProgress.start();
          revalidateTagData("articles");
          router.push("/");
        } else if (prevUrl?.startsWith("/users")) {
          revalidateTagData("articles");
          nProgress.start();
          router.push(prevUrl);
        } else if (!prevUrl) {
          nProgress.start();
          router.push("/");
        } else {
          nProgress.start();
          router.back();
        }
      }}>
      <span className="flex gap-1 items-center">
        <TiArrowLeft size={24} />
        {backHomeCondition ? "/" : prevUrl ? prevUrl : "/"}
      </span>
    </div>
  );
}
