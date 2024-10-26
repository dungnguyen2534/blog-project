import React from "react";
import FollowedPage from "./FollowedPage";
import TargetFilter from "./TargetFilter";
import { notFound } from "next/navigation";
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

export default function FollowedArticlesPage({
  params: { target },
}: FollowedArticlesPageProps) {
  if (target !== "users" && target !== "tags" && target !== "all") {
    notFound();
  }
  return (
    <ArticlesContextProvider followedTarget={target}>
      <main className="container px-0 md:px-8 mt-[4.3rem] md:!mt-[5.4rem]">
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
            <FollowedPage target={target} key={`followed ${target} page`} />
          </TargetFilter>
        </ArticleListTabs>
      </main>
    </ArticlesContextProvider>
  );
}
