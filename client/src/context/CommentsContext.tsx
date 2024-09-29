"use client";

import PostsAPI from "@/api/post";
import { CommentPage, Comment as CommentType } from "@/validation/schema/post";
import { createContext, useCallback, useState } from "react";

interface CommentsContextType {
  commentList: CommentType[];
  setCommentList: React.Dispatch<React.SetStateAction<CommentType[]>>;
  fetchNextPage: (limit?: number, continueAfterId?: string) => Promise<void>;
  isLoading: boolean;
  lastCommentReached: boolean;
  pageLoadError: boolean;
  replyPages: CommentPage[];
  setReplyPages: React.Dispatch<React.SetStateAction<CommentPage[]>>;
}

export const CommentsContext = createContext<CommentsContextType | null>(null);

interface CommentsContextProps {
  children: React.ReactNode;
  postId: string;
  initialPage: CommentPage;
  initialReplyPages: CommentPage[];
}

export default function CommentsContextProvider({
  children,
  initialPage,
  initialReplyPages,
  postId,
}: CommentsContextProps) {
  const [commentList, setCommentList] = useState<CommentType[]>(
    initialPage.comments
  );

  const [replyPages, setReplyPages] =
    useState<CommentPage[]>(initialReplyPages);

  const [isLoading, setIsLoading] = useState(false);
  const [pageLoadError, setPageLoadError] = useState(false);
  const [lastCommentReached, setLastCommentReached] = useState(false);
  const fetchNextPage = useCallback(
    async (limit?: number, continueAfterId?: string) => {
      const query = `posts/${postId}/comments?${
        continueAfterId ? `continueAfterId=${continueAfterId}&` : ""
      }limit=${limit}`;

      setIsLoading(true);
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
    [postId]
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
        replyPages,
        setReplyPages,
      }}>
      {children}
    </CommentsContext.Provider>
  );
}
