"use client";

import useAuth from "@/hooks/useAuth";
import { formatDate, formatUpdatedDate } from "@/lib/utils";
import { Article } from "@/validation/schema/article";
import Link from "next/link";
import { useCallback, useEffect } from "react";
import BookmarkListSkeleton from "./BookmarkListSkeleton";
import { Button } from "@/components/ui/button";
import { BsThreeDots } from "react-icons/bs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ArticlesAPI from "@/api/article";
import { useToast } from "@/components/ui/use-toast";
import { LoaderCircle } from "lucide-react";
import useArticlesLoader from "@/hooks/useArticlesLoader";
import ArticleTags from "@/components/articles/ArticleTags";
import useNavigation from "@/hooks/useNavigation";

interface BookmarkListProps {
  searchQuery: string;
}

export default function BookmarkList({ searchQuery }: BookmarkListProps) {
  const {
    articleList,
    fetchFirstPage,
    fetchNextPage,
    lastArticleReached,
    pageLoadError,
    firstPageLoadError,
    setArticleList,
    isLoading,
    handleArticleListChange,
    noArticlesInReturn,
  } = useArticlesLoader();
  const { user, isLoadingUser, isValidatingUser } = useAuth();
  const handleFetchFirstPage = useCallback(
    (signal?: AbortSignal) => {
      fetchFirstPage(
        signal,
        undefined,
        undefined,
        12,
        undefined,
        undefined,
        undefined,
        true,
        searchQuery
      );
    },
    [fetchFirstPage, searchQuery]
  );

  const handleFetchNextPage = useCallback(() => {
    fetchNextPage(
      undefined,
      undefined,
      12,
      undefined,
      undefined,
      undefined,
      true,
      searchQuery
    );
  }, [fetchNextPage, searchQuery]);

  useEffect(() => {
    const controller = new AbortController();
    handleFetchFirstPage(controller.signal);

    return () => controller.abort();
  }, [handleFetchFirstPage, searchQuery]);

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

  const { toast } = useToast();

  async function removeBookmark(articleId: string) {
    try {
      ArticlesAPI.unBookmarkedArticle(articleId);
      setArticleList((prevArticleList) =>
        prevArticleList.filter((article) => article._id !== articleId)
      );
    } catch {
      toast({
        title: "An error occurred",
        description: "Something went wrong. Please try again later.",
      });
    }
  }

  function articleDate(article: Article) {
    let articleDate;
    if (!(article.createdAt !== article.updatedAt)) {
      articleDate = (
        <time suppressHydrationWarning dateTime={article.createdAt}>
          {formatDate(article.createdAt, false)}
        </time>
      );
    } else {
      articleDate = (
        <time suppressHydrationWarning dateTime={article.createdAt}>
          {`${formatDate(article.createdAt, false)} - ${formatUpdatedDate(
            article.updatedAt
          )}`}
        </time>
      );
    }
    return articleDate;
  }

  function noBookmarks(content: React.ReactNode) {
    return (
      <div className="text-center mt-3 text-neutral-500 dark:text-neutral-400">
        {content}
      </div>
    );
  }

  const { setPrevScrollPosition } = useNavigation();

  return (
    <div>
      {articleList.length > 0 &&
        articleList.map((article, index) => {
          return (
            <article
              key={article._id}
              ref={index === articleList.length - 1 ? articleRef : null}
              className="relative bg-white dark:bg-neutral-950  rounded-none md:rounded-md mb-1 md:mb-2 p-3 md:py-2 main-outline overflow-hidden break-words">
              <Link
                href={"/articles/" + article.slug}
                onClick={() => setPrevScrollPosition(window.scrollY)}>
                <h2 className="text-lg md:text-xl font-bold">
                  {article.title}
                </h2>
              </Link>

              <ArticleTags className="!mt-0 my-1" tags={article.tags} />
              <div className="font-medium text-sm flex items-center gap-1">
                <Link
                  onClick={() =>
                    handleArticleListChange("/users/" + article.author.username)
                  }
                  href={`/users/${article.author.username}`}
                  className="hover:underline">
                  {article.author.username}
                </Link>
                <div className="flex items-center gap-3">
                  <div className="text-muted-foreground text-xs mt-[0.1rem]">
                    <span> • {articleDate(article)},</span>{" "}
                    <span>{article.readingTime} min read</span>
                  </div>
                </div>
              </div>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild aria-label="Article options">
                  <div className="absolute top-1 right-2 text-muted-foreground rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-100 p-2 cursor-pointer">
                    <BsThreeDots size={20} />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-0">
                  <DropdownMenuItem
                    className="px-3 cursor-pointer"
                    onClick={() => removeBookmark(article._id)}>
                    Remove bookmark
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </article>
          );
        })}

      {isLoading &&
        !articleList.length &&
        noBookmarks(
          <LoaderCircle size={24} className="animate-spin mx-auto" />
        )}

      {articleList.length > 0 && !lastArticleReached && (
        <BookmarkListSkeleton skeletonCount={3} />
      )}

      {user && noArticlesInReturn && noBookmarks("No bookmarks found.")}

      {!user &&
        !isLoadingUser &&
        !isValidatingUser &&
        noBookmarks("You need to be logged in to view your bookmarks.")}

      {firstPageLoadError &&
        noBookmarks(
          <div className="flex flex-col gap-2">
            Failed to load bookmarks
            <Button
              className="w-fit mx-auto"
              onClick={() => handleFetchFirstPage()}>
              Try again
            </Button>
          </div>
        )}

      {!firstPageLoadError &&
        pageLoadError &&
        noBookmarks(
          <div className="flex flex-col gap-2">
            Failed to load...
            <Button className="w-fit mx-auto" onClick={handleFetchNextPage}>
              Try again
            </Button>
          </div>
        )}
    </div>
  );
}
