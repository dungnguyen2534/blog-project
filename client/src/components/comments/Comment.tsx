"use client";

import type {
  Comment as CommentType,
  CommentBody,
} from "@/validation/schema/article";
import MarkdownRenderer from "../MarkdownRenderer";
import UserAvatar from "../UserAvatar";
import CommentOptions from "./CommentOptions";
import { DropdownMenuItem } from "../ui/dropdown-menu";
import { DialogTrigger } from "../ui/dialog";
import { MdOutlineDeleteForever } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import useAuth from "@/hooks/useAuth";
import { useRef, useState } from "react";
import CommentForm from "./CommentForm";
import useCommentsLoader from "@/hooks/useCommentsLoader";
import { useToast } from "../ui/use-toast";
import { extractImageUrls } from "@/lib/utils";
import ArticlesAPI from "@/api/article";
import { UnauthorizedError } from "@/lib/http-errors";
import { Button } from "../ui/button";
import CommentActions from "./CommentActions";
import Replies from "./Replies";
import useMobileDeviceDetecter from "@/hooks/useMobileDeviceDetecter";

interface CommentProps {
  comment: CommentType;
  replyComment?: boolean;
  onEditReply?: (comment: CommentType) => void;
  onDeleteReply?: (comment: CommentType) => void;
  className?: string;
}

export default function Comment({
  comment,
  replyComment,
  onEditReply,
  onDeleteReply,
  className,
}: CommentProps) {
  if (replyComment && (!onEditReply || !onDeleteReply)) {
    throw new Error(
      "onEditReply and onDeleteReply are required for replyComment"
    );
  }

  // One level deep comment, which ever comment is being replied to will create a new direct child of the top comment
  const topLevelCommentId = comment.parentCommentId || comment._id;
  const notTopLevelComment = comment.parentCommentId !== undefined;

  const { user } = useAuth();
  const isAuthor = comment.author._id === user?._id;
  const articleId = comment.articleId;
  const commentId = comment._id;

  const { toast } = useToast();
  const { setCommentList } = useCommentsLoader();

  const [isEditing, setIsEditing] = useState(false);

  async function onEditComment(comment: CommentBody) {
    const images = extractImageUrls(comment.body);

    try {
      const newComment = await ArticlesAPI.editComment(articleId, commentId, {
        body: comment.body,
        images,
      });

      if (replyComment) {
        onEditReply && onEditReply(newComment);
      } else {
        setCommentList((prevCommentList) =>
          prevCommentList.map((comment) =>
            comment._id === newComment._id ? newComment : comment
          )
        );
      }

      setIsEditing(false);
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

  const isMobile = useMobileDeviceDetecter();
  const heightRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`flex gap-2 mt-3 md:mt-4 ${className} max-w-full`}>
      <UserAvatar
        username={comment.author.username}
        profilePicUrl={comment.author.profilePicPath}
        className="mt-3 w-10 h-10  sm:mt-2 sm:w-11 sm:h-11"
      />
      {isEditing ? (
        <div className="flex-grow relative">
          <CommentForm
            articleId={comment.articleId}
            submitFunction={onEditComment}
            defaultValue={comment.body}
            noAvatar
            autoFocus
            height={
              isMobile
                ? "10rem"
                : heightRef.current?.clientHeight.toString() + "px"
            }
          />
          <Button
            variant="secondary"
            className="absolute bottom-0 left-[7.5rem] sm:left-[9.5rem]"
            onClick={() => setIsEditing(false)}>
            Dismiss
          </Button>
        </div>
      ) : (
        <div className="flex-grow flex flex-col">
          <div
            ref={heightRef}
            className="flex flex-col gap-[0.85rem] ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white dark:bg-neutral-900 mt-1 rounded-md px-5">
            <CommentOptions
              comment={comment}
              onDeleteReply={replyComment ? onDeleteReply : undefined}>
              {isAuthor ? (
                <>
                  <DropdownMenuItem
                    className="flex items-center gap-2 w-full h-full py-2 cursor-pointer"
                    onClick={() => setIsEditing(true)}>
                    <FaRegEdit size={18} className="mb-[1px]" /> Edit
                  </DropdownMenuItem>

                  <DialogTrigger asChild>
                    <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                      <MdOutlineDeleteForever
                        size={22}
                        className="-ml-1 mb-[1px]"
                      />
                      Delete
                    </DropdownMenuItem>
                  </DialogTrigger>
                </>
              ) : (
                <DropdownMenuItem>(to be implemented)</DropdownMenuItem>
              )}
            </CommentOptions>

            <div className="[overflow-wrap:anywhere]">
              <MarkdownRenderer>{comment.body}</MarkdownRenderer>
            </div>
          </div>
          <CommentActions
            comment={comment}
            articleId={articleId}
            parentCommentId={topLevelCommentId}
            notTopLevelComment={notTopLevelComment}
            usernameToReplyTo={comment.author.username}
          />
          <Replies articleId={articleId} parentCommentId={comment._id} />
        </div>
      )}
    </div>
  );
}
