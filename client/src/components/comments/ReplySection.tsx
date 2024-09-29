"use client";

import { useCallback, useState } from "react";
import PostsAPI from "@/api/post";
import useCommentsLoader from "@/hooks/useCommentsLoader";
import Comment from "./Comment";
import LoadingButton from "../LoadingButton";
import { Button } from "../ui/button";
import { PiHeart } from "react-icons/pi";
import { BsChatSquare } from "react-icons/bs";
import CommentForm from "./CommentForm";
import { Comment as CommentType, CommentBody } from "@/validation/schema/post";
import { useToast } from "../ui/use-toast";
import { UnauthorizedError } from "@/lib/http-errors";

interface ReplySectionProps {
  postId: string;
  parentCommentId: string;
}

export default function ReplySection({
  postId,
  parentCommentId,
}: ReplySectionProps) {
  const { replyPages, setReplyPages } = useCommentsLoader();
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoadError, setPageLoadError] = useState(false);

  const replyPage = replyPages.find((page) =>
    page.comments.find((comment) => comment.parentCommentId === parentCommentId)
  );

  const [replies, setReplies] = useState(replyPage?.comments || []);
  const [lastReplyReached, setLastReplyReached] = useState(
    replyPage?.lastCommentReached !== undefined
      ? replyPage.lastCommentReached
      : true
  );

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

        setLastReplyReached(nextPage.lastCommentReached);
      } catch (error) {
        setIsLoading(false);
        setPageLoadError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [postId, setReplyPages]
  );

  const { toast } = useToast();
  const [isReplying, setIsReplying] = useState(false);
  async function reply(comment: CommentBody) {
    try {
      const newComment = await PostsAPI.createComment(postId, {
        ...comment,
        parentCommentId,
      });

      setReplyPages((prevReplyPages) =>
        prevReplyPages.map((page) => {
          if (
            page.comments.some((comment) => comment._id === parentCommentId)
          ) {
            return {
              ...page,
              comments: [newComment, ...page.comments],
            };
          }
          return page;
        })
      );
      setReplies((prevReplies) => [newComment, ...prevReplies]);
      setIsReplying(false);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        toast({
          title: "Unauthorized",
          description: "You are not authorized to perform this action",
        });
      } else {
        toast({
          title: "Error",
          description: "An error occurred, please try again later",
        });
      }
    }
  }

  function onEditReply(comment: CommentType) {
    setReplies((prevReplies) =>
      prevReplies.map((reply) =>
        reply._id === comment._id ? { ...reply, ...comment } : reply
      )
    );
  }

  function onDeleteReply(comment: CommentType) {
    setReplies((prevReplies) =>
      prevReplies.filter((reply) => reply._id !== comment._id)
    );
  }

  return (
    <>
      <div className="mt-1 ml-[0.65rem] flex items-center gap-3 font-light text-sm">
        {isReplying ? (
          <div className="w-full relative">
            <CommentForm
              postId={postId}
              submitFunction={reply}
              noAvatar
              autoFocus
              height="10rem"
              className="-ml-3 mb-3"
              submitBtnText="Reply"
            />
            <Button
              variant="secondary"
              className="absolute bottom-3 left-[6.7rem] sm:left-[8.7rem]"
              onClick={() => setIsReplying(false)}>
              Dismiss
            </Button>
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              className="gap-2 px-3 py-2 -ml-3 rounded-md">
              <PiHeart size={22} /> Like
              {/* <PiHeartFill /> */}
            </Button>
            <Button
              onClick={() => setIsReplying(true)}
              variant="ghost"
              className="gap-2 px-3 py-2 -ml-3 rounded-md">
              <BsChatSquare size={18} className="mt-[3px]" /> Reply
            </Button>
          </>
        )}
      </div>

      <div className="-mt-3">
        {replies.map((reply) => (
          <Comment
            key={reply._id}
            comment={reply}
            replyComment
            onEditReply={onEditReply}
            onDeleteReply={onDeleteReply}
          />
        ))}
      </div>

      {!lastReplyReached && !pageLoadError && (
        <div className="ml-[3.1rem] mt-5">
          <LoadingButton
            className="w-full"
            variant="secondary"
            text="Load more replies"
            loading={isLoading}
            onClick={() =>
              fetchNextPage(parentCommentId, replies[replies.length - 1]._id, 2)
            }
          />
        </div>
      )}
    </>
  );
}
