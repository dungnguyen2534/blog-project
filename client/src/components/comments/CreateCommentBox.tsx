"use client";

import { CommentBody, CommentBodySchema } from "@/validation/schema/post";
import CommentForm from "./CommentForm";
import { extractImageUrls } from "@/lib/utils";
import PostsAPI from "@/api/post";
import useCommentsLoader from "@/hooks/useCommentsLoader";
import { UnauthorizedError } from "@/lib/http-errors";
import { useToast } from "../ui/use-toast";

interface CreateCommentBoxProps {
  postId: string;
}

export default function CreateCommentBox({ postId }: CreateCommentBoxProps) {
  const { setCommentList } = useCommentsLoader();
  const { toast } = useToast();

  async function onCreateComment(comment: CommentBody) {
    const images = extractImageUrls(comment.body);

    try {
      const newComment = await PostsAPI.createComment(postId, {
        body: comment.body,
        images,
      });
      setCommentList((prevCommentList) => [newComment, ...prevCommentList]);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        toast({
          title: "Unauthorized",
          description: "You need to login to post a comment",
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
    <CommentForm
      postId={postId}
      submitFunction={onCreateComment}
      height="12rem"
    />
  );
}
