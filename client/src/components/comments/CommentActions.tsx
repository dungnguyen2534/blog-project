"use client";

import { Dispatch, useState } from "react";
import PostsAPI from "@/api/post";
import useCommentsLoader from "@/hooks/useCommentsLoader";
import { Button } from "../ui/button";
import { PiHeart } from "react-icons/pi";
import { BsChatSquare } from "react-icons/bs";
import CommentForm from "./CommentForm";
import { CommentBody, Comment as CommentType } from "@/validation/schema/post";
import { useToast } from "../ui/use-toast";
import { UnauthorizedError } from "@/lib/http-errors";

interface CommentActionsProps {
  postId: string;
  parentCommentId: string;
  parentCommentUsername: string;
}

export default function CommentActions({
  postId,
  parentCommentId,
  parentCommentUsername,
}: CommentActionsProps) {
  const { setReplyPages, setNewLocalReplies } = useCommentsLoader();

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
              comments: [...page.comments, newComment],
            };
          }
          return page;
        })
      );

      setNewLocalReplies((prevReplies) => [...prevReplies, newComment]);
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
              defaultValue={`[@${parentCommentUsername}](/users/${parentCommentUsername}) `}
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
    </>
  );
}
