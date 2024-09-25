"use client";

import { useCallback, useEffect } from "react";
import PostEntry from "./PostEntry";
import EmptyPostList from "./EmptyPostList";
import { User } from "@/validation/schema/user";
import PostListSkeleton from "./PostListSkeleton";
import { PostPage } from "@/validation/schema/post";
import usePostsLoader from "@/hooks/usePostsLoader";

interface PostsListProps {
  author?: User;
  tag?: string;
  continueAfterId?: string;
  initialPage: PostPage;
}

export default function PostsList({
  initialPage,
  author,
  tag,
}: PostsListProps) {
  const {
    postList,
    setPostList,
    fetchNextPage,
    lastPostReached,
    pageLoadError,
  } = usePostsLoader();

  useEffect(() => {
    setPostList(initialPage.posts);
  }, [initialPage.posts, setPostList]);

  // using useCallback as a ref makes the useCallback be called when the ref shows up
  const postRef = useCallback(
    (postEntry: HTMLElement | null) => {
      if (postEntry == null) return;

      const observer = new IntersectionObserver(
        async (entries) => {
          if (entries[0].isIntersecting) {
            fetchNextPage(author?._id, tag, 12);
            observer.unobserve(postEntry);
          }
        },
        {
          rootMargin: "150px",
        }
      );

      observer.observe(postEntry);
    },
    [fetchNextPage, tag, author?._id]
  );

  return (
    <>
      <div className="flex flex-col gap-[0.35rem] md:gap-2 m-auto">
        {!author && !initialPage && (
          <EmptyPostList text="Failed to load posts" className="mt-48" />
        )}

        {author && !initialPage && (
          <EmptyPostList
            text={`Failed to load ${author.username}'s posts`}
            hideIcon
          />
        )}

        {!author && initialPage.posts.length === 0 && (
          <EmptyPostList
            text={
              tag
                ? `No posts found with tag: ${tag}`
                : "No one has posted yet, be the fist!"
            }
            className="mt-48"
          />
        )}

        {author && initialPage.posts.length === 0 && (
          <EmptyPostList
            text={`${author.username} hasn't post anything yet...`}
            hideIcon
          />
        )}

        {initialPage && postList.length > 0
          ? postList.map((post, index) => (
              <PostEntry
                key={post._id}
                post={post}
                ref={index === postList.length - 1 ? postRef : null}
              />
            ))
          : initialPage.posts.map((post, index) => (
              <PostEntry
                key={post._id}
                post={post}
                ref={index === postList.length - 1 ? postRef : null}
              />
            ))}

        {!initialPage.lastPostReached && !lastPostReached && !pageLoadError && (
          <PostListSkeleton skeletonCount={3} />
        )}
      </div>
    </>
  );
}
