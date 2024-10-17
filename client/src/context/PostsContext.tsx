"use client";

import PostsAPI from "@/api/post";
import { Post, PostPage } from "@/validation/schema/post";
import { createContext, useCallback, useEffect, useState } from "react";

interface PostsContextType {
  postList: Post[];
  fetchFirstPage: (
    authorId?: string,
    tag?: string,
    limit?: number,
    top?: boolean,
    timeSpan?: "week" | "month" | "year" | "infinity",
    followedTarget?: "users" | "tags" | "all",
    saved?: boolean
  ) => Promise<void>;
  fetchNextPage: (
    authorId?: string,
    tag?: string,
    limit?: number,
    top?: boolean,
    timeSpan?: "week" | "month" | "year" | "infinity",
    followedTarget?: "users" | "tags" | "all",
    saved?: boolean
  ) => Promise<void>;
  setPostList: React.Dispatch<React.SetStateAction<Post[]>>;
  postsLikeCount: { postId: string; likeCount: number }[];
  setPostsLikeCount: React.Dispatch<
    React.SetStateAction<{ postId: string; likeCount: number }[]>
  >;
  isLoading: boolean;
  lastPostReached: boolean;
  pageLoadError: boolean;
  firstPageLoadError: boolean;
}

export const PostsContext = createContext<PostsContextType | null>(null);

interface PostsContextProps {
  children: React.ReactNode;
  initialPage?: PostPage;
  authorId?: string;
  tag?: string;
  top?: boolean;
  timeSpan?: "week" | "month" | "year" | "infinity" | undefined;
  followedTarget?: "users" | "tags" | "all";
  saved?: boolean;
}

export default function PostsContextProvider({
  children,
  initialPage,
  authorId,
  tag,
  top,
  timeSpan,
  followedTarget,
  saved,
}: PostsContextProps) {
  const [postList, setPostList] = useState<Post[]>(initialPage?.posts || []);
  const [isLoading, setIsLoading] = useState(false);
  const [lastPostReached, setLastPostReached] = useState(
    initialPage?.lastPostReached || false
  );
  const [pageLoadError, setPageLoadError] = useState(false);
  const [firstPageLoadError, setFirstPageLoadError] = useState(false);

  const [postsLikeCount, setPostsLikeCount] = useState(
    postList.map((post) => ({ postId: post._id, likeCount: post.likeCount }))
  );

  const continueAfterId = postList[postList.length - 1]?._id;
  const continueAfterLikeCount = postList[postList.length - 1]?.likeCount;

  const fetchFirstPage = useCallback(
    async (
      authorId?: string,
      tag?: string,
      limit?: number,
      top?: boolean,
      timeSpan?: "week" | "month" | "year" | "infinity",
      followedTarget?: "users" | "tags" | "all",
      saved?: boolean
    ) => {
      if (
        (top && followedTarget) ||
        (top && saved) ||
        (followedTarget && saved)
      ) {
        throw new Error(
          "Only one of top, followedTarget, or saved can be true"
        );
      }

      if (top && !timeSpan) {
        throw new Error("Time span must be provided for top posts");
      }

      setFirstPageLoadError(false);
      setIsLoading(true);

      const query = `/posts?${tag ? `tag=${tag}` : ""}${
        authorId ? `&authorId=${authorId}` : ""
      }${limit ? `&limit=${limit}` : ""}${saved ? `&saved=true` : ""}`;

      try {
        let firstPage: PostPage;
        if (top) {
          firstPage = await PostsAPI.getTopPosts(
            timeSpan || "week",
            continueAfterId,
            continueAfterLikeCount.toString()
          );
        } else if (followedTarget) {
          firstPage = await PostsAPI.getPostList(
            `/posts?followedTarget=${followedTarget}`
          );
        } else {
          firstPage = await PostsAPI.getPostList(query);
        }

        setPostList(firstPage.posts);
        setLastPostReached(firstPage.lastPostReached);
      } catch {
        setFirstPageLoadError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [continueAfterId, continueAfterLikeCount]
  );

  const fetchNextPage = useCallback(
    async (
      authorId?: string,
      tag?: string,
      limit?: number,
      top?: boolean,
      timeSpan?: "week" | "month" | "year" | "infinity",
      followedTarget?: "users" | "tags" | "all",
      saved?: boolean
    ) => {
      if (
        (top && followedTarget) ||
        (top && saved) ||
        (followedTarget && saved)
      ) {
        throw new Error(
          "Only one of top, followedTarget, or saved can be true"
        );
      }

      if (top && !timeSpan) {
        throw new Error("Time span must be provided for top posts");
      }

      setPageLoadError(false);
      setIsLoading(true);

      const query = `/posts?${tag ? `tag=${tag}` : ""}${
        authorId ? `&authorId=${authorId}` : ""
      }${continueAfterId ? `&continueAfterId=${continueAfterId}` : ""}${
        limit ? `&limit=${limit}` : ""
      }${saved ? `&saved=true` : ""}`;

      try {
        let nextPage: PostPage;
        if (top) {
          nextPage = await PostsAPI.getTopPosts(
            timeSpan || "week",
            continueAfterId,
            continueAfterLikeCount.toString()
          );
        } else if (followedTarget) {
          nextPage = await PostsAPI.getPostList(
            `/posts?followedTarget=${followedTarget}&continueAfterId=${continueAfterId}`
          );
        } else {
          nextPage = await PostsAPI.getPostList(query);
        }

        setPostList((prevPostList) => [...prevPostList, ...nextPage.posts]);
        setLastPostReached(nextPage.lastPostReached);
      } catch (error) {
        setIsLoading(false);
        setPageLoadError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [continueAfterId, continueAfterLikeCount]
  );

  useEffect(() => {
    if (!initialPage) {
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
        fetchFirstPage(authorId, tag, 12);
      }
    }
  }, [
    initialPage,
    fetchFirstPage,
    authorId,
    tag,
    top,
    followedTarget,
    saved,
    fetchNextPage,
    timeSpan,
  ]);

  useEffect(() => {
    setPostsLikeCount(
      postList.map((post) => ({
        postId: post._id,
        likeCount: post.likeCount,
      }))
    );
  }, [postList, setPostsLikeCount, initialPage, setPostList]);

  return (
    <PostsContext.Provider
      value={{
        postList,
        setPostList,
        fetchFirstPage,
        fetchNextPage,
        lastPostReached,
        isLoading,
        pageLoadError,
        firstPageLoadError,
        postsLikeCount,
        setPostsLikeCount,
      }}>
      {children}
    </PostsContext.Provider>
  );
}
