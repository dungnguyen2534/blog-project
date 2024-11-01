"use client";

import ArticlesAPI from "@/api/article";
import {
  CommentPage,
  Comment as CommentType,
  Article,
} from "@/validation/schema/article";
import { createContext, useCallback, useState } from "react";
import useSWR from "swr";

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
  articleAuthorId: string;
  isClientSideLoading: boolean;
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
  const articleId = article._id;

  const [commentList, setCommentList] = useState<CommentType[]>(
    initialPage?.comments || []
  );
  const [replyPages, setReplyPages] = useState<CommentPage[]>(
    initialReplyPages || []
  );
  const [replies, setReplies] = useState<CommentType[]>(
    initialReplyPages?.flatMap((page) => page.comments) || []
  );

  const [lastCommentReached, setLastCommentReached] = useState<boolean>(
    initialPage?.lastCommentReached ?? true
  );

  const [commentCount, setCommentCount] = useState(article.commentCount);
  const [newLocalReplies, setNewLocalReplies] = useState<CommentType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoadError, setPageLoadError] = useState(false);

  // replace the SSR comments with the client-side comments to get latest comments state
  const { isLoading: isClientSideLoading } = useSWR(
    "comments",
    async () => {
      const { comments, totalComments } = await ArticlesAPI.getCommentList(
        articleId
      );

      const replyPagesPromises = comments.map(async (parentComment) => {
        if (parentComment.replyCount === 0)
          return {
            comments: [],
            lastCommentReached: true,
            totalComments: 0,
          };

        const replyPage = await ArticlesAPI.getCommentList(
          articleId,
          undefined,
          parentComment._id,
          6
        );

        return replyPage;
      });
      const replyPages = await Promise.all(replyPagesPromises);

      setCommentList(comments);
      setReplies(replyPages.flatMap((page) => page.comments));
      setCommentCount(totalComments);
    },
    {
      revalidateOnFocus: false,
    }
  );

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
        articleAuthorId: article.author._id,
        isClientSideLoading,
      }}>
      {children}
    </CommentsContext.Provider>
  );
}
