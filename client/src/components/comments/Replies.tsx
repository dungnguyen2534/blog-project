"use client";

import useCommentsLoader from "@/hooks/useCommentsLoader";
import { Dispatch, useCallback, useEffect, useState } from "react";
import LoadingButton from "../LoadingButton";
import Comment from "./Comment";
import { Comment as CommentType } from "@/validation/schema/post";
import PostsAPI from "@/api/post";

interface RepliesProps {
  postId: string;
  parentCommentId: string;
}

export default function Replies({ postId, parentCommentId }: RepliesProps) {
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
  }

  function onDeleteReply(comment: CommentType) {
    setReplies((prevReplies) =>
      prevReplies.filter((reply) => reply._id !== comment._id)
    );

    setNewLocalReplies((prevReplies) =>
      prevReplies.filter((reply) => reply._id !== comment._id)
    );
  }

  const fetchNextPage = useCallback(
    async (
      parentCommentId: string,
      continueAfterId: string,
      limit?: number
    ) => {
      const query = `posts/${postId}/comments?parentCommentId=${parentCommentId}&continueAfterId=${continueAfterId}&limit=${limit}`;
      setIsLoading(true);
      try {
        const nextPage = await PostsAPI.getCommentList(postId, query);
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
    [postId, setReplyPages, setReplies, setNewLocalReplies]
  );

  const repliesToShow = replies.filter(
    (reply) => reply.parentCommentId === parentCommentId
  );

  const localReplies = newLocalReplies.filter(
    (reply) => reply.parentCommentId === parentCommentId
  );

  return (
    <div className="">
      <div className="-mt-3">
        {repliesToShow.map((reply) => (
          <Comment
            replyComment
            className="!mt-2 first:!mt-5"
            key={reply._id}
            comment={reply}
            onEditReply={onEditReply}
            onDeleteReply={onDeleteReply}
          />
        ))}
      </div>
      {!lastReplyReached && !pageLoadError && (
        <div className="ml-[3.1rem] mt-5 mb-1">
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
