"use client";

import PostsAPI from "@/api/post";
import { Post } from "@/validation/schema/post";
import { createContext, useCallback, useState } from "react";

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
}

export const PostsContext = createContext<PostsContextType | null>(null);

interface PostsContextProps {
  children: React.ReactNode;
  initialPage?: Post[];
}

export default function PostsContextProvider({
  children,
  initialPage,
}: PostsContextProps) {
  const [postList, setPostList] = useState<Post[]>(initialPage || []);
  const [isLoading, setIsLoading] = useState(false);
  const [lastPostReached, setLastPostReached] = useState(false);
  const [pageLoadError, setPageLoadError] = useState(false);

  const [postsLikeCount, setPostsLikeCount] = useState(
    postList.map((post) => ({ postId: post._id, likeCount: post.likeCount }))
  );

  const continueAfterId = postList[postList.length - 1]?._id;

  const fetchFirstPage = useCallback(
    async (authorId?: string, tag?: string, limit?: number) => {
      setIsLoading(true);

      const query = `/posts?${tag ? `tag=${tag}` : ""}${
        authorId ? `&authorId=${authorId}` : ""
      }${limit ? `&limit=${limit}` : ""}`;

      try {
        const firstPage = await PostsAPI.getPostList(query);
        setPostList(firstPage.posts);
        setLastPostReached(firstPage.lastPostReached);
      } catch (error) {
        setPageLoadError(true);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const fetchNextPage = useCallback(
    async (authorId?: string, tag?: string, limit?: number) => {
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
        postsLikeCount,
        setPostsLikeCount,
      }}>
      {children}
    </PostsContext.Provider>
  );
}
