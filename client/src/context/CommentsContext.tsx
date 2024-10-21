"use client";

import ArticlesAPI from "@/api/article";
import {
  CommentPage,
  Comment as CommentType,
  Article,
} from "@/validation/schema/article";
import { createContext, useCallback, useEffect, useState } from "react";

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
  articleAuthorId: string;
}

export const CommentsContext = createContext<CommentsContextType | null>(null);

interface CommentsContextProps {
  children: React.ReactNode;
  article: Article;
  initialPage?: CommentPage;
  initialReplyPages?: CommentPage[];
}

export default function CommentsContextProvider({
  children,
  initialPage,
  initialReplyPages,
  article,
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

  const [commentCount, setCommentCount] = useState(article.commentCount);

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

  const articleId = article._id;
  const fetchFirstPage = useCallback(
    async (limit?: number) => {
      setIsLoading(true);
      try {
        const firstPage = await ArticlesAPI.getCommentList(
          articleId,
          `articles/${articleId}/comments?limit=${limit}`
        );
        const replyPagesPromises = firstPage.comments.map(async (comment) => {
          if (comment.replyCount === 0)
            return {
              comments: [],
              lastCommentReached: true,
              totalComments: 0,
            };

          const replyPage = await ArticlesAPI.getCommentList(
            articleId,
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
    [articleId]
  );

  const fetchNextPage = useCallback(
    async (limit?: number, continueAfterId?: string) => {
      const query = `articles/${articleId}/comments?${
        continueAfterId ? `continueAfterId=${continueAfterId}&` : ""
      }limit=${limit}`;

      setIsLoading(true);
      try {
        const nextPage = await ArticlesAPI.getCommentList(articleId, query);
        const nextReplyPagesPromises = nextPage.comments.map(
          async (comment) => {
            if (comment.replyCount === 0)
              return {
                comments: [],
                lastCommentReached: true,
                totalComments: 0,
              };

            const replyPage = await ArticlesAPI.getCommentList(
              articleId,
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
    [articleId]
  );

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
        articleAuthorId: article.author._id,
      }}>
      {children}
    </CommentsContext.Provider>
  );
}
