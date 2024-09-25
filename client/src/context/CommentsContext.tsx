"use client";

import PostsAPI from "@/api/post";
import { CommentPage, Comment as CommentType } from "@/validation/schema/post";
import { createContext, useCallback, useState } from "react";

interface CommentsContextType {
  commentList: CommentType[];
  fetchNextPage: (parentCommentId?: string, limit?: number) => Promise<void>;
  setCommentList: React.Dispatch<React.SetStateAction<CommentType[]>>;
  isLoading: boolean;
  lastCommentReached: boolean;
  pageLoadError: boolean;
}

export const CommentsContext = createContext<CommentsContextType | null>(null);

interface CommentsContextProps {
  children: React.ReactNode;
  postId: string;
  initialPage: CommentPage;
}

export default function CommentsContextProvider({
  children,
  initialPage,
  postId,
}: CommentsContextProps) {
  const [commentList, setCommentList] = useState<CommentType[]>(
    initialPage.comments
  );

  const [isLoading, setIsLoading] = useState(false);
  const [lastCommentReached, setLastCommentReached] = useState(false);
  const [pageLoadError, setPageLoadError] = useState(false);

  const continueAfterId = commentList[commentList.length - 1]?._id;
  const fetchNextPage = useCallback(
    async (parentCommentId?: string, limit?: number) => {
      setIsLoading(true);

      const query = `posts/${postId}/comments?${
        parentCommentId ? `parentCommentId=${parentCommentId}&` : ""
      }${
        continueAfterId ? `continueAfterId=${continueAfterId}&` : ""
      }limit=${limit}`;

      try {
        const nextPage = await PostsAPI.getCommentList(postId, query);

        setCommentList((prevCommentList) => [
          ...prevCommentList,
          ...nextPage.comments,
        ]);

        setLastCommentReached(nextPage.lastCommentReached);
      } catch (error) {
        setIsLoading(false);
        setPageLoadError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [postId, continueAfterId]
  );

  return (
    <CommentsContext.Provider
      value={{
        commentList,
        setCommentList,
        fetchNextPage,
        lastCommentReached,
        isLoading,
        pageLoadError,
      }}>
      {children}
    </CommentsContext.Provider>
  );
}
