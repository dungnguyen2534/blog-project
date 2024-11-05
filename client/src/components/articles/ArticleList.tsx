"use client";

import { useCallback, useEffect } from "react";
import ArticleEntry from "./ArticleEntry";
import EmptyArticleList from "./EmptyArticleList";
import { User } from "@/validation/schema/user";
import ArticleListSkeleton from "./ArticleListSkeleton";
import useArticlesLoader from "@/hooks/useArticlesLoader";
import useFollowUser from "@/hooks/useFollowUser";
import { usePathname } from "next/navigation";

interface ArticlesListProps {
  author?: User;
  tag?: string;
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
    setArticleList,
    fetchFirstPage,
    firstPageFetched,
    fetchNextPage,
    lastArticleReached,
    pageLoadError,
    firstPageLoadError,
  } = useArticlesLoader();

  // fetcher functions
  const handleFetchFirstPage = useCallback(
    (signal?: AbortSignal) => {
      fetchFirstPage(
        signal,
        author?._id,
        tag,
        12,
        top,
        timeSpan,
        followedTarget
      );
    },
    [fetchFirstPage, tag, author?._id, top, followedTarget, timeSpan]
  );

  const handleFetchNextPage = useCallback(() => {
    fetchNextPage(author?._id, tag, 12, top, timeSpan, followedTarget);
  }, [fetchNextPage, tag, author?._id, top, followedTarget, timeSpan]);

  const pathname = usePathname();
  useEffect(() => {
    // prevent race condition with AbortController
    const controller = new AbortController();
    if (!firstPageFetched) {
      handleFetchFirstPage(controller.signal);
    }

    return () => controller.abort();
  }, [firstPageFetched, handleFetchFirstPage, pathname, setArticleList]);

  // sync author follow status if there is more than one of the same author on the list
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

  // ref as a callback make the callback to be called when the component is mounted
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
    <div className="flex flex-col gap-1 md:gap-2 m-auto mb-2">
      {articleList.length > 0 &&
        articleList.map((article, index) => (
          <ArticleEntry
            key={article._id}
            article={article}
            ref={index === articleList.length - 1 ? articleRef : null}
          />
        ))}

      {!firstPageLoadError && !lastArticleReached && !pageLoadError && (
        <>
          {followedTarget ? (
            <>
              <ArticleListSkeleton skeletonCount={1} />
            </>
          ) : (
            <>
              <ArticleListSkeleton
                className="hidden md:flex"
                skeletonCount={4}
              />
              <ArticleListSkeleton
                className="flex md:hidden"
                skeletonCount={6}
              />
            </>
          )}
        </>
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
          retryFunction={() => fetchFirstPage(undefined, author._id, tag, 12)}
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
