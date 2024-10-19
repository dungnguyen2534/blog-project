"use client";

import PostTags from "@/components/posts/PostTags";
import useAuth from "@/hooks/useAuth";
import usePostsLoader from "@/hooks/usePostsLoader";
import {
  calculateReadingTime,
  formatDate,
  formatUpdatedDate,
} from "@/lib/utils";
import { Post } from "@/validation/schema/post";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import BookmarkListSkeleton from "./BookmarkListSkeleton";
import { Button } from "@/components/ui/button";
import { BsThreeDots } from "react-icons/bs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PostsAPI from "@/api/post";
import { useToast } from "@/components/ui/use-toast";
import { LoaderCircle } from "lucide-react";

interface BookmarkListProps {
  tag?: string;
}

export default function BookmarkList({ tag }: BookmarkListProps) {
  const {
    postList,
    fetchFirstPage,
    fetchNextPage,
    lastPostReached,
    pageLoadError,
    firstPageLoadError,
    setPostList,
    isLoading,
  } = usePostsLoader();
  const { user, isLoadingUser, isValidatingUser } = useAuth();

  const handleFetchFirstPage = useCallback(() => {
    fetchFirstPage(undefined, tag, 12, undefined, undefined, undefined, true);
  }, [fetchFirstPage, tag]);

  const handleFetchNextPage = useCallback(() => {
    fetchNextPage(undefined, tag, 12, undefined, undefined, undefined, true);
  }, [fetchNextPage, tag]);

  const postRef = useCallback(
    (postEntry: HTMLElement | null) => {
      if (!postEntry || lastPostReached) return;

      const observer = new IntersectionObserver(
        async (entries) => {
          if (entries[0].isIntersecting) {
            handleFetchNextPage();
            observer.unobserve(postEntry);
          }
        },
        { rootMargin: "150px" }
      );

      observer.observe(postEntry);
    },
    [handleFetchNextPage, lastPostReached]
  );

  const { toast } = useToast();

  async function removeBookmark(postId: string) {
    try {
      PostsAPI.unsavePost(postId);
      setPostList((prevPostList) =>
        prevPostList.filter((post) => post._id !== postId)
      );
    } catch {
      toast({
        title: "An error occurred",
        description: "Something went wrong. Please try again later.",
      });
    }
  }

  function postDate(post: Post) {
    let postDate;
    if (!(post.createdAt !== post.updatedAt)) {
      postDate = (
        <time suppressHydrationWarning dateTime={post.createdAt}>
          {formatDate(post.createdAt, false)}
        </time>
      );
    } else {
      postDate = (
        <time suppressHydrationWarning dateTime={post.createdAt}>
          {`${formatDate(post.createdAt, false)} - ${formatUpdatedDate(
            post.updatedAt
          )}`}
        </time>
      );
    }
    return postDate;
  }

  function noBookmarks(content: React.ReactNode) {
    return (
      <div className="text-center mt-3 text-neutral-500 dark:text-neutral-400">
        {content}
      </div>
    );
  }

  return (
    <div>
      {postList.length > 0 &&
        postList.map((post, index) => {
          return (
            <article
              key={post._id}
              ref={index === postList.length - 1 ? postRef : null}
              className="relative bg-white dark:bg-neutral-900 rounded-none md:rounded-md mb-1 md:mb-2 p-3 md:py-2 ring-1 ring-[#f1f1f1] dark:ring-neutral-900 overflow-hidden break-words">
              <Link href={"/posts/" + post.slug}>
                <h2 className="text-lg md:text-xl font-bold">{post.title}</h2>
                {post.summary && (
                  <p className="line-clamp-2 break-words my-1 text-sm text-neutral-600 dark:text-neutral-400">
                    {post.summary}
                  </p>
                )}
              </Link>

              <PostTags className="!mt-0 my-1" tags={post.tags} />
              <div className="font-medium text-sm flex items-center gap-1">
                <Link
                  href={`/users/${post.author.username}`}
                  className="hover:underline">
                  {post.author.username}
                </Link>
                <div className="flex items-center gap-3">
                  <div className="text-muted-foreground text-xs mt-[0.1rem]">
                    <span> • {postDate(post)},</span>{" "}
                    <span>{calculateReadingTime(post.body)} min read</span>
                  </div>
                </div>
              </div>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild aria-label="Post options">
                  <div className="absolute top-1 right-2 text-muted-foreground rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-100 p-2 cursor-pointer">
                    <BsThreeDots size={20} />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="min-w-0">
                  <DropdownMenuItem
                    className="px-3 cursor-pointer"
                    onClick={() => removeBookmark(post._id)}>
                    Remove bookmark
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </article>
          );
        })}

      {isLoading &&
        postList.length === 0 &&
        noBookmarks(
          <LoaderCircle size={24} className="animate-spin mx-auto" />
        )}

      {postList.length > 0 && !lastPostReached && (
        <BookmarkListSkeleton skeletonCount={3} />
      )}

      {user &&
        !pageLoadError &&
        !firstPageLoadError &&
        !isLoading &&
        postList.length === 0 &&
        noBookmarks("No bookmarks found.")}

      {!user &&
        !isLoadingUser &&
        !isValidatingUser &&
        noBookmarks("You need to be logged in to view your bookmarks.")}

      {firstPageLoadError &&
        noBookmarks(
          <div className="flex flex-col gap-2">
            Failed to load bookmarks
            <Button className="w-fit mx-auto" onClick={handleFetchFirstPage}>
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
