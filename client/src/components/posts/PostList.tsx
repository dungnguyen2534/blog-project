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
  initialPage?: PostPage;
}

export default function PostsList({
  initialPage,
  author,
  tag,
}: PostsListProps) {
  const {
    postList,
    setPostList,
    setPostsLikeCount,
    fetchFirstPage,
    fetchNextPage,
    lastPostReached,
    pageLoadError,
    firstPageLoadError,
  } = usePostsLoader();

  useEffect(() => {
    if (initialPage !== undefined) {
      setPostList(initialPage.posts);
    } else {
      fetchFirstPage(author?._id, tag, 12);
    }
  }, [initialPage, fetchFirstPage, author?._id, tag, setPostList]);

  useEffect(() => {
    setPostsLikeCount(
      postList.map((post) => ({ postId: post._id, likeCount: post.likeCount }))
    );
  }, [postList, setPostsLikeCount, initialPage, setPostList]);

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
    <div className="flex flex-col gap-[0.35rem] md:gap-2 m-auto">
      {postList.length > 0
        ? postList.map((post, index) => (
            <PostEntry
              key={post._id}
              post={post}
              ref={index === postList.length - 1 ? postRef : null}
            />
          ))
        : initialPage?.posts.map((post, index) => (
            <PostEntry
              key={post._id}
              post={post}
              ref={index === postList.length - 1 ? postRef : null}
            />
          ))}

      {!firstPageLoadError &&
        !initialPage?.lastPostReached &&
        !lastPostReached &&
        !pageLoadError && <PostListSkeleton skeletonCount={4} />}

      {!author && firstPageLoadError && (
        <EmptyPostList
          retryFunction={() => fetchFirstPage(undefined, tag, 12)}
          text="Failed to load posts"
          className="mt-48"
        />
      )}

      {author && firstPageLoadError && (
        <EmptyPostList
          text={`Failed to load ${author.username}'s posts`}
          retryFunction={() => fetchFirstPage(author._id, tag, 12)}
          className="mt-48"
          hideIcon
        />
      )}

      {!author && pageLoadError && (
        <EmptyPostList
          text="Failed to load posts"
          retryFunction={() => fetchNextPage(undefined, tag, 12)}
          hideIcon
        />
      )}

      {author && pageLoadError && (
        <EmptyPostList
          text="Failed to load posts"
          retryFunction={() => fetchNextPage(author._id, tag, 12)}
          hideIcon
        />
      )}
    </div>
  );
}
