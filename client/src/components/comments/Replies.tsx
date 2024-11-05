"use client";

import useCommentsLoader from "@/hooks/useCommentsLoader";
import { Dispatch, useCallback, useEffect, useState } from "react";
import LoadingButton from "../LoadingButton";
import Comment from "./Comment";
import { Article, Comment as CommentType } from "@/validation/schema/article";
import ArticlesAPI from "@/api/article";
import { revalidatePathData } from "@/lib/revalidate";
import useArticlesLoader from "@/hooks/useArticlesLoader";
import useNavigation from "@/hooks/useNavigation";

interface RepliesProps {
  article: Article;
  parentCommentId: string;
}

export default function Replies({ article, parentCommentId }: RepliesProps) {
  const {
    replyPages,
    setReplyPages,
    replies,
    setReplies,
    newLocalReplies,
    setNewLocalReplies,
  } = useCommentsLoader();

  const [isLoading, setIsLoading] = useState(false);
  const [pageLoadError, setPageLoadError] = useState(false);
  const { articleList, setArticleList } = useArticlesLoader();

  const replyPage = replyPages.find((page) =>
    page.comments.find((c) => c.parentCommentId === parentCommentId)
  );

  const [lastReplyReached, setLastReplyReached] = useState(
    replyPage?.lastCommentReached !== undefined
      ? replyPage.lastCommentReached
      : true
  );

  function onEditReply(comment: CommentType) {
    setReplies((prevReplies) =>
      prevReplies.map((reply) =>
        reply._id === comment._id ? { ...reply, ...comment } : reply
      )
    );

    setNewLocalReplies((prevReplies) =>
      prevReplies.map((reply) =>
        reply._id === comment._id ? { ...reply, ...comment } : reply
      )
    );
    revalidatePathData(`/articles/${article.slug}`);
  }

  function onDeleteReply(comment: CommentType) {
    setReplies((prevReplies) =>
      prevReplies.filter((reply) => reply._id !== comment._id)
    );

    setNewLocalReplies((prevReplies) =>
      prevReplies.filter((reply) => reply._id !== comment._id)
    );

    const articleIndex = articleList.findIndex((a) => a._id === article._id);

    if (articleIndex !== -1) {
      const updatedArticleList = [...articleList];
      updatedArticleList[articleIndex].commentCount -= 1;
      setArticleList(updatedArticleList);
    }
    revalidatePathData(`/articles/${article.slug}`);
  }

  const fetchNextPage = useCallback(
    async (
      parentCommentId: string,
      continueAfterId: string,
      limit?: number
    ) => {
      const query = `articles/${article._id}/comments?parentCommentId=${parentCommentId}&continueAfterId=${continueAfterId}&limit=${limit}`;
      setIsLoading(true);
      try {
        const nextPage = await ArticlesAPI.getCommentList(article._id, query);
        setReplyPages((prevReplyPage) => [...prevReplyPage, nextPage]);
        setReplies((prevReplies) => [...prevReplies, ...nextPage.comments]);

        const nextPageCommentIds = new Set(
          nextPage.comments.map((comment) => comment._id)
        );

        setNewLocalReplies((prevReplies) =>
          prevReplies.filter((reply) => !nextPageCommentIds.has(reply._id))
        );

        setLastReplyReached(nextPage.lastCommentReached);
      } catch (error) {
        setIsLoading(false);
        setPageLoadError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [article, setReplyPages, setReplies, setNewLocalReplies]
  );

  const repliesToShow = replies.filter(
    (reply) => reply.parentCommentId === parentCommentId
  );

  const localReplies = newLocalReplies.filter(
    (reply) => reply.parentCommentId === parentCommentId
  );

  return (
    <div>
      <div className="-mt-2 mb-3">
        {repliesToShow.map((reply) => (
          <Comment
            article={article}
            replyComment
            className="mt-2 first:!mt-5"
            key={reply._id}
            comment={reply}
            onEditReply={onEditReply}
            onDeleteReply={onDeleteReply}
          />
        ))}
      </div>
      {!lastReplyReached && !pageLoadError && (
        <div className="ml-[3.15rem] mt-5 mb-7">
          <LoadingButton
            className="w-full"
            variant="secondary"
            text="Load more replies"
            loading={isLoading}
            onClick={() =>
              fetchNextPage(
                parentCommentId,
                repliesToShow[repliesToShow.length - 1]._id,
                6
              )
            }
          />
        </div>
      )}
      <div className="-mt-3">
        {localReplies.map((reply) => (
          <Comment
            article={article}
            replyComment
            className="!mt-2 first:!mt-5"
            key={reply._id}
            comment={reply}
            onEditReply={onEditReply}
            onDeleteReply={onDeleteReply}
          />
        ))}
      </div>
    </div>
  );
}
