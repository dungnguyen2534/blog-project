"use client";

import type { Comment } from "@/validation/schema/post";
import CommentAuthor from "./CommentAuthor";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { BsThreeDots } from "react-icons/bs";
import { useState } from "react";
import { FaRegEdit } from "react-icons/fa";
import { MdOutlineDeleteForever } from "react-icons/md";
import LoadingButton from "../LoadingButton";
import { Button } from "../ui/button";
import useAuth from "@/hooks/useAuth";
import useCommentsLoader from "@/hooks/useCommentsLoader";
import { useToast } from "../ui/use-toast";
import PostsAPI from "@/api/post";

interface CommentOptionsProps {
  comment: Comment;
}

export default function CommentOptions({ comment }: CommentOptionsProps) {
  const [showDialog, setShowDialog] = useState(false);

  const { user } = useAuth();
  const isAuthor = comment.author._id === user?._id;

  const { setCommentList } = useCommentsLoader();
  const { toast } = useToast();

  const [isDeleting, setIsDeleting] = useState(false);

  async function deleteComment() {
    setIsDeleting(true);

    try {
      await PostsAPI.deleteComment(comment.postId, comment._id);
      setCommentList((prev) =>
        prev.filter((prevComment) => prevComment._id !== comment._id)
      );
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
            <DropdownMenuTrigger className="absolute right-0 top-0">
              <div className="rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-100 p-2">
                <BsThreeDots size={20} />
              </div>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent>
            {isAuthor && (
              <>
                <DropdownMenuItem className="flex items-center gap-2 w-full h-full py-2">
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
          </DropdownMenuContent>
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
