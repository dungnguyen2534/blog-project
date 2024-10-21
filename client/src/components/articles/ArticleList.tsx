"use client";
import { useCallback, useEffect } from "react";
import ArticleEntry from "./ArticleEntry";
import EmptyArticleList from "./EmptyArticleList";
import { User } from "@/validation/schema/user";
import ArticleListSkeleton from "./ArticleListSkeleton";
import useArticlesLoader from "@/hooks/useArticlesLoader";
import useFollowUser from "@/hooks/useFollowUser";

interface ArticlesListProps {
  author?: User;
  tag?: string;
  saved?: boolean;
  top?: boolean;
  timeSpan?: "week" | "month" | "year" | "infinity";
  followedTarget?: "users" | "tags" | "all";
}

export default function ArticleList({
  author,
  tag,
  top,
  timeSpan,
  followedTarget,
}: ArticlesListProps) {
  if (top && followedTarget) {
    throw new Error("Only one of top or followed can be true");
  }
  if (top && !timeSpan) {
    throw new Error("Time span is required for top articles");
  }

  const {
    articleList,
    fetchFirstPage,
    fetchNextPage,
    lastArticleReached,
    pageLoadError,
    firstPageLoadError,
  } = useArticlesLoader();
  const { setUsersToFollow } = useFollowUser();

  useEffect(() => {
    setUsersToFollow(
      articleList.map((article) => ({
        userId: article.author._id,
        followed: !!article.author.isLoggedInUserFollowing,
        totalFollowers: article.author.totalFollowers,
      }))
    );
  }, [setUsersToFollow, articleList]);

  const handleFetchFirstPage = useCallback(() => {
    if (top) {
      fetchFirstPage(undefined, undefined, 12, top, timeSpan);
    } else if (followedTarget) {
      fetchFirstPage(
        undefined,
        undefined,
        12,
        undefined,
        undefined,
        followedTarget
      );
    } else {
      fetchFirstPage(author?._id, tag, 12);
    }
  }, [fetchFirstPage, tag, author?._id, top, followedTarget, timeSpan]);

  const handleFetchNextPage = useCallback(() => {
    if (top) {
      fetchNextPage(undefined, undefined, 12, top, timeSpan);
    } else if (followedTarget) {
      fetchNextPage(
        undefined,
        undefined,
        12,
        undefined,
        undefined,
        followedTarget
      );
    } else {
      fetchNextPage(author?._id, tag, 12);
    }
  }, [fetchNextPage, tag, author?._id, top, followedTarget, timeSpan]);

  const articleRef = useCallback(
    (articleEntry: HTMLElement | null) => {
      if (!articleEntry || lastArticleReached) return;

      const observer = new IntersectionObserver(
        async (entries) => {
          if (entries[0].isIntersecting) {
            handleFetchNextPage();
            observer.unobserve(articleEntry);
          }
        },
        { rootMargin: "150px" }
      );

      observer.observe(articleEntry);
    },
    [handleFetchNextPage, lastArticleReached]
  );

  return (
    <div className="flex flex-col gap-[0.35rem] md:gap-2 m-auto">
      {articleList.length > 0 &&
        articleList.map((article, index) => (
          <ArticleEntry
            key={article._id}
            article={article}
            ref={index === articleList.length - 1 ? articleRef : null}
          />
        ))}
      {!firstPageLoadError && !lastArticleReached && !pageLoadError && (
        <ArticleListSkeleton skeletonCount={4} />
      )}
      {!author && firstPageLoadError && (
        <EmptyArticleList
          retryFunction={async () => handleFetchFirstPage()}
          text="Failed to load"
          className="mt-48"
        />
      )}
      {author && firstPageLoadError && (
        <EmptyArticleList
          text={`Failed to load`}
          retryFunction={() => fetchFirstPage(author._id, tag, 12)}
          className="mt-48"
          hideIcon
        />
      )}
      {!author && pageLoadError && (
        <EmptyArticleList
          text="Failed to load"
          retryFunction={async () => handleFetchNextPage()}
          hideIcon
        />
      )}
      {author && pageLoadError && (
        <EmptyArticleList
          text="Failed to load"
          retryFunction={() => fetchNextPage(author._id, tag, 12)}
          hideIcon
        />
      )}
    </div>
  );
}
