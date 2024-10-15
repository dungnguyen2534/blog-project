import PostsAPI from "@/api/post";
import PostList from "@/components/posts/PostList";
import PostListTabs from "@/components/posts/PostListTabs";
import PostsContextProvider from "@/context/PostsContext";
import { cookies } from "next/headers";
import React from "react";
import { NotFoundError } from "@/lib/http-errors";
import { notFound } from "next/navigation";
import TimeSpanFilter from "../TimeSpanFilter";

interface TopPostsPageProps {
  params: { time: "week" | "month" | "year" | "infinity" | undefined };
}

export async function generateMetadata({
  params: { time },
}: TopPostsPageProps) {
  const title =
    time && time !== "infinity"
      ? "Top posts this " + time + " - Devdaily"
      : time === "infinity"
      ? "Top posts all time - Devdaily"
      : "Top posts - Devdaily";

  return {
    title: title,
  };
}

export default async function TopPostsPage({
  params: { time },
}: TopPostsPageProps) {
  const userCookie = cookies().get("connect.sid");

  let initialPage;
  try {
    initialPage = await PostsAPI.getTopPosts(
      time,
      undefined,
      undefined,
      undefined,
      userCookie
    );
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    } else {
      initialPage = undefined;
    }
  }

  const defaultTimeValue = time
    ? ((time.charAt(0).toUpperCase() + time.slice(1)) as
        | "Week"
        | "Month"
        | "Year"
        | "Infinity")
    : "Week";

  return (
    <PostsContextProvider
      top
      initialPage={initialPage}
      timeSpan={time ?? "week"}>
      <main className="flex container px-0 md:px-8 my-[0.35rem] md:my-2">
        <PostListTabs defaultValue="Top" className="">
          <TimeSpanFilter defaultValue={defaultTimeValue}>
            <PostList
              top
              key={`top-posts-${time ?? "week"}`}
              timeSpan={time ?? "week"}
            />
          </TimeSpanFilter>
        </PostListTabs>
      </main>
    </PostsContextProvider>
  );
}
