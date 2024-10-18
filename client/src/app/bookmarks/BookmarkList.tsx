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
import { useCallback } from "react";
import BookmarkListSkeleton from "./BookmarkListSkeleton";

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

  return (
    <div>
      {postList.length > 0 &&
        postList.map((post, index) => {
          return (
            <article
              key={post._id}
              ref={index === postList.length - 1 ? postRef : null}
              className="bg-white dark:bg-neutral-900 rounded-none md:rounded-md mb-1 md:mb-2 p-3 md:py-2 ring-1 ring-[#f1f1f1] dark:ring-neutral-900 overflow-hidden break-words">
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
                <div>{post.author.username}</div>
                <div className="flex items-center gap-3">
                  <div className="text-muted-foreground text-xs mt-[0.1rem]">
                    <span> • {postDate(post)},</span>{" "}
                    <span>{calculateReadingTime(post.body)} min read</span>
                  </div>
                </div>
              </div>
            </article>
          );
        })}

      {!pageLoadError && !firstPageLoadError && !lastPostReached && (
        <BookmarkListSkeleton skeletonCount={5} />
      )}

      {user &&
        postList.length === 0 &&
        !pageLoadError &&
        !firstPageLoadError && (
          <div className="text-center mt-3 text-neutral-500 dark:text-neutral-400">
            You have no bookmarks.
          </div>
        )}

      {!user && !isLoadingUser && !isValidatingUser && (
        <div className="text-center mt-3 text-neutral-500 dark:text-neutral-400">
          You need to be logged in to view your bookmarks
        </div>
      )}
    </div>
  );
}
