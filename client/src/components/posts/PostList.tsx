"use client";
import { useCallback, useEffect } from "react";
import PostEntry from "./PostEntry";
import EmptyPostList from "./EmptyPostList";
import { User } from "@/validation/schema/user";
import PostListSkeleton from "./PostListSkeleton";
import usePostsLoader from "@/hooks/usePostsLoader";
import useFollowUser from "@/hooks/useFollowUser";

interface PostsListProps {
  author?: User;
  tag?: string;
  saved?: boolean;
  top?: boolean;
  timeSpan?: "week" | "month" | "year" | "infinity";
  followedTarget?: "users" | "tags" | "all";
}

export default function PostList({
  author,
  tag,
  top,
  timeSpan,
  followedTarget,
  saved,
}: PostsListProps) {
  if ((top && followedTarget) || (top && saved) || (followedTarget && saved)) {
    throw new Error("Only one of top, followed, or saved can be true");
  }
  if (top && !timeSpan) {
    throw new Error("Time span is required for top posts");
  }

  const {
    postList,
    fetchFirstPage,
    fetchNextPage,
    lastPostReached,
    pageLoadError,
    firstPageLoadError,
  } = usePostsLoader();
  const { setUsersToFollow } = useFollowUser();

  useEffect(() => {
    setUsersToFollow(
      postList.map((post) => ({
        userId: post.author._id,
        followed: !!post.author.isLoggedInUserFollowing,
        totalFollowers: post.author.totalFollowers,
      }))
    );
  }, [setUsersToFollow, postList]);

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
    } else if (saved) {
      fetchFirstPage(
        undefined,
        undefined,
        12,
        undefined,
        undefined,
        undefined,
        saved
      );
    } else {
      fetchFirstPage(author?._id, tag, 12);
    }
  }, [fetchFirstPage, tag, author?._id, top, followedTarget, saved, timeSpan]);

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
    } else if (saved) {
      fetchNextPage(
        undefined,
        undefined,
        12,
        undefined,
        undefined,
        undefined,
        saved
      );
    } else {
      fetchNextPage(author?._id, tag, 12);
    }
  }, [fetchNextPage, tag, author?._id, top, followedTarget, saved, timeSpan]);

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

  return (
    <div className="flex flex-col gap-[0.35rem] md:gap-2 m-auto">
      {postList.length > 0 &&
        postList.map((post, index) => (
          <PostEntry
            key={post._id}
            post={post}
            ref={index === postList.length - 1 ? postRef : null}
          />
        ))}
      {!firstPageLoadError && !lastPostReached && !pageLoadError && (
        <PostListSkeleton skeletonCount={4} />
      )}
      {!author && firstPageLoadError && (
        <EmptyPostList
          retryFunction={async () => handleFetchFirstPage()}
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
          retryFunction={async () => handleFetchNextPage()}
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
