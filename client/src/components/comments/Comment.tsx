"use client";

import type { Comment, CommentBody } from "@/validation/schema/post";
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
import PostsAPI from "@/api/post";
import { UnauthorizedError } from "@/lib/http-errors";
import { Button } from "../ui/button";

interface CommentProps {
  comment: Comment;
}

export default function Comment({ comment }: CommentProps) {
  const { user } = useAuth();
  const isAuthor = comment.author._id === user?._id;
  const postId = comment.postId;
  const commentId = comment._id;

  const [isEditing, setIsEditing] = useState(false);
  const { setCommentList } = useCommentsLoader();
  const { toast } = useToast();

  async function onEditComment(comment: CommentBody) {
    const images = extractImageUrls(comment.body);

    try {
      const newComment = await PostsAPI.editComment(postId, commentId, {
        body: comment.body,
        images,
      });
      setCommentList((prevCommentList) =>
        prevCommentList.map((comment) =>
          comment._id === newComment._id ? newComment : comment
        )
      );

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

  const isMobile = window.matchMedia("(max-width: 640px)").matches;
  const heightRef = useRef<HTMLDivElement>(null);

  return (
    <div className="flex gap-2 mt-5">
      <UserAvatar
        username={comment.author.username}
        profilePicUrl={comment.author.profilePicPath}
        className="mt-2 w-11 h-11"
      />
      {isEditing ? (
        <div className="flex-grow relative">
          <CommentForm
            postId={comment.postId}
            submitFunction={onEditComment}
            initialValue={comment.body}
            noAvatar
            autoFocus
            height={
              isMobile
                ? "12rem"
                : heightRef.current?.clientHeight.toString() + "px"
            }
          />
          <Button
            variant="secondary"
            className="flex gap-1 absolute bottom-0 left-[7.5rem] sm:left-[9.5rem]"
            onClick={() => setIsEditing(false)}>
            Stop<span className="hidden sm:block">Editing</span>
          </Button>
        </div>
      ) : (
        <div
          ref={heightRef}
          className="flex-grow flex flex-col gap-[0.85rem] ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white dark:bg-neutral-900 mt-1 rounded-sm w-fit px-5 overflow-hidden">
          <CommentOptions comment={comment}>
            {isAuthor && (
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
            )}
          </CommentOptions>
          <MarkdownRenderer>{comment.body}</MarkdownRenderer>
        </div>
      )}
    </div>
  );
}
