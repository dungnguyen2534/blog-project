"use client";

import type { Comment as CommentType } from "@/validation/schema/post";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { BsThreeDots } from "react-icons/bs";
import { useState } from "react";
import LoadingButton from "../LoadingButton";
import { Button } from "../ui/button";
import useCommentsLoader from "@/hooks/useCommentsLoader";
import { useToast } from "../ui/use-toast";
import PostsAPI from "@/api/post";
import MiniProfileProvider from "../MiniProfileProvider";
import { TooltipTrigger } from "../ui/tooltip";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface CommentOptionsProps {
  children: React.ReactNode;
  comment: CommentType;
  onDeleteReply?: (comment: CommentType) => void;
}

export default function CommentOptions({
  children,
  comment,
  onDeleteReply,
}: CommentOptionsProps) {
  const { toast } = useToast();
  const { commentList, setCommentList, setReplyPages, fetchNextPage } =
    useCommentsLoader();

  const [showDialog, setShowDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteComment() {
    setIsDeleting(true);

    try {
      await PostsAPI.deleteComment(comment.postId, comment._id);

      if (onDeleteReply) {
        onDeleteReply(comment);
      } else {
        if (comment._id === commentList[commentList.length - 1]._id) {
          fetchNextPage(1, comment._id);
        }
        setCommentList((prev) =>
          prev.filter((prevComment) => prevComment._id !== comment._id)
        );

        setReplyPages((prev) =>
          prev.map((page) => ({
            ...page,
            comments: page.comments.filter(
              (prevComment) => prevComment.parentCommentId !== comment._id
            ),
          }))
        );
      }
    } catch (error) {
      setShowDialog(false);
      setIsDeleting(false);
      toast({
        title: "Error",
        description: "An error occurred, please try again later",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="relative">
      <CommentAuthor comment={comment} />
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DropdownMenu modal={false}>
          <div
            className="text-neutral-500 dark:text-neutral-400 
             -mt-5">
            <DropdownMenuTrigger className="absolute -right-2 top-1">
              <div className="rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-100 p-2">
                <BsThreeDots size={20} />
              </div>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent>{children}</DropdownMenuContent>
        </DropdownMenu>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure to delete this comment?</DialogTitle>
            <DialogDescription>
              This action cannot be undone, your comment will be permanently
              deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => setShowDialog(false)}>Turn back</Button>
            <LoadingButton
              loading={isDeleting}
              text="Sure, delete it"
              loadingText="Deleting..."
              onClick={deleteComment}
              className="bg-red-600 dark:hover:bg-red-700 text-white"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CommentAuthor({ comment }: { comment: CommentType }) {
  let commentDate;
  if (!(comment.createdAt !== comment.updatedAt)) {
    commentDate = (
      <time
        suppressHydrationWarning
        className="text-xs text-neutral-500 dark:text-neutral-400"
        dateTime={comment.createdAt}>
        {formatDate(comment.createdAt)}
      </time>
    );
  } else {
    commentDate = (
      <time
        suppressHydrationWarning
        className="text-xs text-neutral-500 dark:text-neutral-400"
        dateTime={comment.createdAt}>
        {formatDate(comment.createdAt)}
      </time>
    );
  }

  const author = comment.author;
  return (
    <div className="my-2">
      <MiniProfileProvider author={author} customTrigger>
        <div className="relative flex">
          <TooltipTrigger asChild>
            <Link
              href={"/users/" + author.username}
              className="flex gap-[0.4rem] items-center">
              <span className="text-sm font-medium mb-5">
                {author.username}
              </span>
            </Link>
          </TooltipTrigger>
          <div className="text-nowrap text-xs text-neutral-500 dark:text-neutral-400 absolute bottom-0 left-0">
            {commentDate}
            {comment.createdAt !== comment.updatedAt && " - Edited"}
          </div>
        </div>
      </MiniProfileProvider>
    </div>
  );
}
