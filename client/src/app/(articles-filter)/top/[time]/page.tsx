import React from "react";
import TimeSpanFilter from "../TimeSpanFilter";
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
  const defaultTimeValue = time
    ? ((time.charAt(0).toUpperCase() + time.slice(1)) as
        | "Week"
        | "Month"
        | "Year"
        | "Infinity")
    : "Week";

  return (
    <ArticlesContextProvider top timeSpan={time ?? "week"}>
      <main className="flex container px-0 md:px-8 mt-[4.3rem] md:!mt-20">
        <ArticleListTabs defaultValue="Top" className="">
          <TimeSpanFilter defaultValue={defaultTimeValue}>
            <ArticleList
              top
              key={`top-articles-${time ?? "week"}`}
              timeSpan={time ?? "week"}
            />
          </TimeSpanFilter>
        </ArticleListTabs>
      </main>
    </ArticlesContextProvider>
  );
}
