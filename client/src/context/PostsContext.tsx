"use client";

import PostsAPI from "@/api/post";
import { Post } from "@/validation/schema/post";
import { createContext, useCallback, useState } from "react";

interface PostsContextType {
  postList: Post[];
  fetchNextPage: (
    authorId?: string,
    tag?: string,
    limit?: number
  ) => Promise<void>;
  setPostList: React.Dispatch<React.SetStateAction<Post[]>>;
  isLoading: boolean;
  lastPostReached: boolean;
  pageLoadError: boolean;
}

export const PostsContext = createContext<PostsContextType | null>(null);

interface PostsContextProps {
  children: React.ReactNode;
}

export default function PostsContextProvider({ children }: PostsContextProps) {
  const [postList, setPostList] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastPostReached, setLastPostReached] = useState(false);
  const [pageLoadError, setPageLoadError] = useState(false);

  const continueAfterId = postList[postList.length - 1]?._id;

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
        fetchNextPage,
        lastPostReached,
        isLoading,
        pageLoadError,
      }}>
      {children}
    </PostsContext.Provider>
  );
}
