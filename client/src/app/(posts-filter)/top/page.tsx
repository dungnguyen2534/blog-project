import PostsAPI from "@/api/post";
import PostList from "@/components/posts/PostList";
import PostListTabs from "@/components/posts/PostListTabs";
import PostsContextProvider from "@/context/PostsContext";
import { cookies } from "next/headers";
import React from "react";

export default async function TopPostsPage() {
  const userCookie = cookies().get("connect.sid");
  let initialPage;
  try {
    initialPage = await PostsAPI.getTopPosts(
      "week",
      undefined,
      undefined,
      undefined,
      userCookie
    );
  } catch {
    initialPage = undefined;
  }

  return (
    <PostsContextProvider top initialPage={initialPage}>
      <main className="container px-0 md:px-8 my-[0.35rem] md:my-3">
        <PostListTabs defaultValue="Top">
          <PostList top />
        </PostListTabs>
      </main>
    </PostsContextProvider>
  );
}
