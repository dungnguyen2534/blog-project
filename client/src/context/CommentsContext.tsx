"use client";

import PostsAPI from "@/api/post";
import {
  CommentPage,
  Comment as CommentType,
  Post,
} from "@/validation/schema/post";
import { createContext, useCallback, useEffect, useRef, useState } from "react";

interface CommentsContextType {
  commentList: CommentType[];
  setCommentList: React.Dispatch<React.SetStateAction<CommentType[]>>;
  fetchFirstPage: (limit?: number) => Promise<void>;
  fetchNextPage: (limit?: number, continueAfterId?: string) => Promise<void>;
  isLoading: boolean;
  lastCommentReached: boolean;
  setLastCommentReached: React.Dispatch<React.SetStateAction<boolean>>;
  pageLoadError: boolean;
  replyPages: CommentPage[];
  setReplyPages: React.Dispatch<React.SetStateAction<CommentPage[]>>;
  replies: CommentType[];
  setReplies: React.Dispatch<React.SetStateAction<CommentType[]>>;
  newLocalReplies: CommentType[];
  setNewLocalReplies: React.Dispatch<React.SetStateAction<CommentType[]>>;
  commentCount: number;
  setCommentCount: React.Dispatch<React.SetStateAction<number>>;
  commentsLikeCount: { commentId: string; likeCount: number }[];
  setCommentsLikeCount: React.Dispatch<
    React.SetStateAction<{ commentId: string; likeCount: number }[]>
  >;
  postAuthorId: string;
}

export const CommentsContext = createContext<CommentsContextType | null>(null);

interface CommentsContextProps {
  children: React.ReactNode;
  post: Post;
  initialPage?: CommentPage;
  initialReplyPages?: CommentPage[];
}

export default function CommentsContextProvider({
  children,
  initialPage,
  initialReplyPages,
  post,
}: CommentsContextProps) {
  const [commentList, setCommentList] = useState<CommentType[]>(
    initialPage?.comments || []
  );

  const [replyPages, setReplyPages] = useState<CommentPage[]>(
    initialReplyPages || []
  );

  const [replies, setReplies] = useState<CommentType[]>(
    initialReplyPages?.flatMap((page) => page.comments) || []
  );

  const [newLocalReplies, setNewLocalReplies] = useState<CommentType[]>([]);

  const [commentsLikeCount, setCommentsLikeCount] = useState(
    [...commentList, ...replies, ...newLocalReplies].map((comment) => ({
      commentId: comment._id,
      likeCount: comment.likeCount,
    }))
  );

  const [isLoading, setIsLoading] = useState(false);
  const [pageLoadError, setPageLoadError] = useState(false);
  const [lastCommentReached, setLastCommentReached] = useState<boolean>(
    initialPage?.lastCommentReached ?? true
  );

  const postId = post._id;
  const fetchFirstPage = useCallback(
    async (limit?: number) => {
      setIsLoading(true);
      try {
        const firstPage = await PostsAPI.getCommentList(
          postId,
          `posts/${postId}/comments?limit=${limit}`
        );
        const replyPagesPromises = firstPage.comments.map(async (comment) => {
          const replyPage = await PostsAPI.getCommentList(
            postId,
            undefined,
            comment._id,
            6
          );
          return replyPage;
        });

        const replyPages = await Promise.all(replyPagesPromises);

        setCommentList(firstPage.comments);
        setReplyPages(replyPages);
        setReplies(replyPages.flatMap((page) => page.comments));
        setLastCommentReached(firstPage.lastCommentReached);
      } catch (error) {
        setPageLoadError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [postId]
  );

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
              comment._id,
              6
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

  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  useEffect(() => {
    async function fetchCommentCount() {
      try {
        const { totalComments } = await PostsAPI.getCommentList(
          postId,
          `/posts/${postId}/comments?limit=0`
        );
        setCommentCount(totalComments);
      } catch (error) {
        setCommentCount(post.commentCount || 0);
      }
    }

    fetchCommentCount();
  }, [postId, post.commentCount]);

  useEffect(() => {
    if (initialPage == undefined || initialReplyPages == undefined) {
      fetchFirstPage(12);
    }
  }, [initialPage, initialReplyPages, fetchFirstPage, setCommentList]);

  useEffect(() => {
    setCommentsLikeCount(
      [...commentList, ...replies, ...newLocalReplies].map((comment) => ({
        commentId: comment._id,
        likeCount: comment.likeCount,
      }))
    );
  }, [commentList, replies, newLocalReplies, setCommentsLikeCount]);

  return (
    <CommentsContext.Provider
      value={{
        commentList,
        setCommentList,
        fetchFirstPage,
        fetchNextPage,
        lastCommentReached,
        setLastCommentReached,
        isLoading,
        pageLoadError,
        replyPages,
        setReplyPages,
        replies,
        setReplies,
        newLocalReplies,
        setNewLocalReplies,
        commentCount,
        setCommentCount,
        commentsLikeCount,
        setCommentsLikeCount,
        postAuthorId: post.author._id,
      }}>
      {children}
    </CommentsContext.Provider>
  );
}
