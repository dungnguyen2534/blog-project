"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import PostEntry from "./PostEntry";
import usePostsLoader from "@/hooks/usePostsLoader";
import EmptyPostList from "./EmptyPostList";
import { User } from "@/validation/schema/user";
import PostListSkeleton from "./PostListSkeleton";
import { PostPage } from "@/validation/schema/post";

interface PostsListProps {
  firstPage: PostPage;
  author?: User;
  tag?: string;
}

export default function PostsList({ author, firstPage, tag }: PostsListProps) {
  const {
    pages,
    isLoadingPage,
    pageToLoad,
    isLoadingPageError,
    setPageToLoad,
  } = usePostsLoader(author?._id, 2, 12, tag); // firstPage is ssr, fetch post client side start from page 2

  const pageToLoadRef = useRef(pageToLoad);
  pageToLoadRef.current = pageToLoad;

  // using useCallback as a ref makes the useCallback be called when the ref shows up
  const postRef = useCallback(
    (postEntry: HTMLElement | null) => {
      if (postEntry == null) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            setPageToLoad(pageToLoadRef.current + 1);
            observer.unobserve(postEntry);
          }
        },
        {
          rootMargin: "150px",
        }
      );

      observer.observe(postEntry);
    },
    [setPageToLoad]
  );

  return (
    <>
      <div className="flex flex-col gap-[0.35rem] sm:gap-2 m-auto">
        {!author && !firstPage && (
          <EmptyPostList text="Failed to load posts" className="mt-48" />
        )}

        {!author && firstPage.posts.length === 0 && (
          <EmptyPostList
            text={
              tag
                ? `No posts found with tag: ${tag}`
                : "No one has posted yet..."
            }
            className="mt-48"
          />
        )}

        {author && firstPage.posts.length === 0 && (
          <EmptyPostList
            text={`${author.username} hasn't post anything yet...`}
            hideIcon
          />
        )}

        {author && !firstPage && (
          <EmptyPostList
            text={`Failed to load ${author.username}'s posts`}
            hideIcon
          />
        )}

        {firstPage.posts.map((post) => (
          <PostEntry key={post._id} post={post} />
        ))}

        {firstPage &&
          !isLoadingPageError &&
          !isLoadingPage &&
          pages.map((page) =>
            page.posts.map((post, index) => (
              <PostEntry
                key={post._id}
                post={post}
                ref={index === page.posts.length - 1 ? postRef : null}
              />
            ))
          )}

        {/* current page is the pageToLoad, totalPages from the ssr first page api call */}
        {pageToLoad < firstPage.totalPages && (
          <PostListSkeleton skeletonCount={3} />
        )}
      </div>
    </>
  );
}
