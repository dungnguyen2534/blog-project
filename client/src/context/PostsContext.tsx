"use client";

import PostsAPI from "@/api/post";
import { Post, PostPage } from "@/validation/schema/post";
import { createContext, useCallback, useEffect, useState } from "react";

interface PostsContextType {
  postList: Post[];
  fetchFirstPage: (
    authorId?: string,
    tag?: string,
    limit?: number
  ) => Promise<void>;
  fetchNextPage: (
    authorId?: string,
    tag?: string,
    limit?: number
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
}

export default function PostsContextProvider({
  children,
  initialPage,
  authorId,
  tag,
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

  const fetchFirstPage = useCallback(
    async (authorId?: string, tag?: string, limit?: number) => {
      setFirstPageLoadError(false);
      setIsLoading(true);

      const query = `/posts?${tag ? `tag=${tag}` : ""}${
        authorId ? `&authorId=${authorId}` : ""
      }${limit ? `&limit=${limit}` : ""}`;

      try {
        const firstPage = await PostsAPI.getPostList(query);
        setPostList(firstPage.posts);
        setLastPostReached(firstPage.lastPostReached);
      } catch {
        setFirstPageLoadError(true);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchNextPage = useCallback(
    async (authorId?: string, tag?: string, limit?: number) => {
      setPageLoadError(false);
      setIsLoading(true);
      const query = `/posts?${tag ? `tag=${tag}` : ""}${
        authorId ? `&authorId=${authorId}` : ""
      }${continueAfterId ? `&continueAfterId=${continueAfterId}` : ""}${
        limit ? `&limit=${limit}` : ""
      }`;

      try {
        const nextPage = await PostsAPI.getPostList(query);

        setPostList((prevPostList) => [...prevPostList, ...nextPage.posts]);
        setLastPostReached(nextPage.lastPostReached);
      } catch (error) {
        setIsLoading(false);
        setPageLoadError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [continueAfterId]
  );

  useEffect(() => {
    if (!initialPage) {
      fetchFirstPage(authorId, tag, 12);
    } else {
      setPostList(initialPage.posts);
    }
  }, [initialPage, fetchFirstPage, authorId, tag, setPostList]);

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
