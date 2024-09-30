"use client";

import PostsAPI from "@/api/post";
import usePostsLoader from "@/hooks/usePostsLoader";
import { CommentPage, Comment as CommentType } from "@/validation/schema/post";
import { createContext, useCallback, useEffect, useRef, useState } from "react";

interface CommentsContextType {
  commentList: CommentType[];
  setCommentList: React.Dispatch<React.SetStateAction<CommentType[]>>;
  fetchNextPage: (limit?: number, continueAfterId?: string) => Promise<void>;
  isLoading: boolean;
  lastCommentReached: boolean;
  pageLoadError: boolean;
  replyPages: CommentPage[];
  setReplyPages: React.Dispatch<React.SetStateAction<CommentPage[]>>;
  replies: CommentType[];
  setReplies: React.Dispatch<React.SetStateAction<CommentType[]>>;
  newLocalReplies: CommentType[];
  setNewLocalReplies: React.Dispatch<React.SetStateAction<CommentType[]>>;
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

  const [replies, setReplies] = useState<CommentType[]>(
    initialReplyPages.flatMap((page) => page.comments)
  );

  const [newLocalReplies, setNewLocalReplies] = useState<CommentType[]>([]);

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
        const nextReplyPagesPromises = nextPage.comments.map(
          async (comment) => {
            const replyPage = await PostsAPI.getCommentList(
              postId,
              undefined,
              comment._id
            );
            return replyPage;
          }
        );

        const nextReplyPages = await Promise.all(nextReplyPagesPromises);

        setCommentList((prevCommentList) => [
          ...prevCommentList,
          ...nextPage.comments,
        ]);

        setReplyPages((prevReplyPages) => [
          ...prevReplyPages,
          ...nextReplyPages,
        ]);

        setReplies((prevReplies) => [
          ...prevReplies,
          ...nextReplyPages.flatMap((page) => page.comments),
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
        replies,
        setReplies,
        newLocalReplies,
        setNewLocalReplies,
      }}>
      {children}
    </CommentsContext.Provider>
  );
}
