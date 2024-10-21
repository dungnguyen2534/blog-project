import { cookies } from "next/headers";
import React from "react";
import FollowedPage from "./FollowedPage";
import TargetFilter from "./TargetFilter";
import { notFound } from "next/navigation";
import ArticlesAPI from "@/api/article";
import ArticlesContextProvider from "@/context/ArticlesContext";
import ArticleListTabs from "@/components/articles/ArticleListTabs";

interface FollowedArticlesPageProps {
  params: { target: "users" | "tags" | "all" | undefined };
}

export async function generateMetadata({
  params: { target },
}: FollowedArticlesPageProps) {
  const title =
    target === "users"
      ? "Followed users"
      : target === "tags"
      ? "Followed tags"
      : "Followed";

  return {
    title: title,
  };
}

export default async function FollowedArticlesPage({
  params: { target },
}: FollowedArticlesPageProps) {
  if (target !== "users" && target !== "tags" && target !== "all") {
    notFound();
  }

  const userCookie = cookies().get("connect.sid");

  let initialPage;
  try {
    initialPage = await ArticlesAPI.getArticleList(
      "/articles?followedTarget=" + target,
      userCookie
    );
  } catch {
    initialPage = undefined;
  }

  return (
    <ArticlesContextProvider followedTarget={target} initialPage={initialPage}>
      <div className="container px-0 md:px-8 my-[0.35rem] md:my-2">
        <ArticleListTabs defaultValue="Followed">
          <TargetFilter
            defaultValue={
              target
                ? ((target.charAt(0).toUpperCase() + target.slice(1)) as
                    | "Users"
                    | "Tags"
                    | "All")
                : "All"
            }>
            <FollowedPage
              target={target}
              key={`followed ${target} page`}
              noInitialPage={!!!initialPage}
            />
          </TargetFilter>
        </ArticleListTabs>
      </div>
    </ArticlesContextProvider>
  );
}
