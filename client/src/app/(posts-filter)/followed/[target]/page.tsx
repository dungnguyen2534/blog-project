import PostsAPI from "@/api/post";
import PostListTabs from "@/components/posts/PostListTabs";
import PostsContextProvider from "@/context/PostsContext";
import { cookies } from "next/headers";
import React from "react";
import FollowedPage from "./FollowedPage";
import TargetFilter from "./TargetFilter";
import { notFound } from "next/navigation";

interface FollowedPostsPageProps {
  params: { target: "users" | "tags" | undefined };
}

export async function generateMetadata({
  params: { target },
}: FollowedPostsPageProps) {
  const title =
    target === "users"
      ? "Followed Users"
      : target === "tags"
      ? "Followed Tags"
      : "Followed";

  return {
    title: title,
  };
}

export default async function FollowedPostsPage({
  params: { target },
}: FollowedPostsPageProps) {
  if (target !== "users" && target !== "tags") {
    notFound();
  }

  const userCookie = cookies().get("connect.sid");

  let initialPage;
  try {
    initialPage = await PostsAPI.getPostList(
      "/posts?followedTarget=" + target,
      userCookie
    );
  } catch {
    initialPage = undefined;
  }

  return (
    <PostsContextProvider followedTarget={target} initialPage={initialPage}>
      <main className="container px-0 md:px-8 my-[0.35rem] md:my-2">
        <PostListTabs defaultValue="Followed">
          <TargetFilter
            defaultValue={
              target
                ? ((target.charAt(0).toUpperCase() + target.slice(1)) as
                    | "Users"
                    | "Tags")
                : "Users"
            }>
            <FollowedPage
              target={target}
              key={`followed ${target} page`}
              noInitialPage={!!!initialPage}
            />
          </TargetFilter>
        </PostListTabs>
      </main>
    </PostsContextProvider>
  );
}
