"use client";

import { useState } from "react";
import PostsAPI from "@/api/post";
import useCommentsLoader from "@/hooks/useCommentsLoader";
import { Button } from "../ui/button";
import { IoChatboxOutline } from "react-icons/io5";
import CommentForm from "./CommentForm";
import { CommentBody, Comment as CommentType } from "@/validation/schema/post";
import { useToast } from "../ui/use-toast";
import { UnauthorizedError } from "@/lib/http-errors";
import useAuth from "@/hooks/useAuth";
import useAuthDialogs from "@/hooks/useAuthDialogs";
import LikeCommentButton from "./LikeCommentButton";

interface CommentActionsProps {
  comment: CommentType;
  postId: string;
  parentCommentId: string;
  notTopLevelComment?: boolean;
  usernameToReplyTo: string;
}

export default function CommentActions({
  comment,
  postId,
  parentCommentId,
  notTopLevelComment,
  usernameToReplyTo,
}: CommentActionsProps) {
  const { setReplyPages, setNewLocalReplies, setCommentCount } =
    useCommentsLoader();

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
      setCommentCount((prevCount) => prevCount + 1);
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

  const { user } = useAuth();
  const { showSignIn } = useAuthDialogs();

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
              defaultValue={
                notTopLevelComment
                  ? `[@${usernameToReplyTo}](/users/${usernameToReplyTo}) `
                  : ""
              }
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
            <LikeCommentButton
              commentId={comment._id}
              initialLikeCount={comment.likeCount}
              isLoggedInUserLiked={comment.isLoggedInUserLiked}
              className="gap-2 px-3 py-2 -ml-3 rounded-md"
              variant="ghost"
            />
            <Button
              onClick={() => {
                if (!user) {
                  showSignIn();
                  return;
                }

                setIsReplying(true);
              }}
              variant="ghost"
              className="gap-2 px-3 py-2 -ml-3 rounded-md">
              <IoChatboxOutline size={22} className="mt-[0.18rem]" /> Reply
            </Button>
          </>
        )}
      </div>
    </>
  );
}
