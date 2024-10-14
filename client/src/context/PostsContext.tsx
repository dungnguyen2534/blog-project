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
    followed?: boolean,
    saved?: boolean
  ) => Promise<void>;
  fetchNextPage: (
    authorId?: string,
    tag?: string,
    limit?: number,
    top?: boolean,
    followed?: boolean,
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
  followed?: boolean;
  saved?: boolean;
}

export default function PostsContextProvider({
  children,
  initialPage,
  authorId,
  tag,
  top,
  timeSpan,
  followed,
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
      followed?: boolean,
      saved?: boolean
    ) => {
      if ((top && followed) || (top && saved) || (followed && saved)) {
        throw new Error("Only one of top, followed, or saved can be true");
      }

      setFirstPageLoadError(false);
      setIsLoading(true);

      const query = `/posts?${tag ? `tag=${tag}` : ""}${
        authorId ? `&authorId=${authorId}` : ""
      }${limit ? `&limit=${limit}` : ""}${followed ? `&followed=true` : ""}${
        saved ? `&saved=true` : ""
      }`;

      try {
        const firstPage = top
          ? await PostsAPI.getTopPosts(
              timeSpan || "week",
              continueAfterId,
              continueAfterLikeCount.toString(),
              12
            )
          : await PostsAPI.getPostList(query);

        setPostList(firstPage.posts);
        setLastPostReached(firstPage.lastPostReached);
      } catch {
        setFirstPageLoadError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [timeSpan, continueAfterId, continueAfterLikeCount]
  );

  const fetchNextPage = useCallback(
    async (
      authorId?: string,
      tag?: string,
      limit?: number,
      top?: boolean,
      followed?: boolean,
      saved?: boolean
    ) => {
      if ((top && followed) || (top && saved) || (followed && saved)) {
        throw new Error("Only one of top, followed, or saved can be true");
      }

      setPageLoadError(false);
      setIsLoading(true);

      const query = `/posts?${tag ? `tag=${tag}` : ""}${
        authorId ? `&authorId=${authorId}` : ""
      }${continueAfterId ? `&continueAfterId=${continueAfterId}` : ""}${
        limit ? `&limit=${limit}` : ""
      }${followed ? `&followed=true` : ""}${saved ? `&saved=true` : ""}`;

      try {
        const nextPage = top
          ? await PostsAPI.getTopPosts(
              timeSpan || "week",
              continueAfterId,
              continueAfterLikeCount.toString()
            )
          : await PostsAPI.getPostList(query);

        setPostList((prevPostList) => [...prevPostList, ...nextPage.posts]);
        setLastPostReached(nextPage.lastPostReached);
      } catch (error) {
        setIsLoading(false);
        setPageLoadError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [continueAfterId, timeSpan, continueAfterLikeCount]
  );

  useEffect(() => {
    if (!initialPage) {
      if (top) {
        fetchFirstPage(undefined, undefined, 12, top);
      } else if (followed) {
        fetchFirstPage(undefined, undefined, 12, undefined, followed);
      } else if (saved) {
        fetchFirstPage(undefined, undefined, 12, undefined, undefined, saved);
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
    followed,
    saved,
    fetchNextPage,
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
