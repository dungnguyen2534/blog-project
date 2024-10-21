import { cookies } from "next/headers";
import React from "react";
import { NotFoundError } from "@/lib/http-errors";
import { notFound } from "next/navigation";
import TimeSpanFilter from "../TimeSpanFilter";
import ArticlesAPI from "@/api/article";
import ArticlesContextProvider from "@/context/ArticlesContext";
import ArticleListTabs from "@/components/articles/ArticleListTabs";
import ArticleList from "@/components/articles/ArticleList";

interface TopArticlesPageProps {
  params: { time: "week" | "month" | "year" | "infinity" | undefined };
}

export async function generateMetadata({
  params: { time },
}: TopArticlesPageProps) {
  const title =
    time && time !== "infinity"
      ? "Top articles this " + time + " - Devflow"
      : time === "infinity"
      ? "Top articles all time - Devflow"
      : "Top articles - Devflow";

  return {
    title: title,
  };
}

export default async function TopArticlesPage({
  params: { time },
}: TopArticlesPageProps) {
  const userCookie = cookies().get("connect.sid");

  let initialPage;
  try {
    initialPage = await ArticlesAPI.getTopArticles(
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
    <ArticlesContextProvider
      top
      initialPage={initialPage}
      timeSpan={time ?? "week"}>
      <div className="flex container px-0 md:px-8 my-[0.35rem] md:my-2">
        <ArticleListTabs defaultValue="Top" className="">
          <TimeSpanFilter defaultValue={defaultTimeValue}>
            <ArticleList
              top
              key={`top-articles-${time ?? "week"}`}
              timeSpan={time ?? "week"}
            />
          </TimeSpanFilter>
        </ArticleListTabs>
      </div>
    </ArticlesContextProvider>
  );
}
