"use client";

import {
  Article,
  CommentBody,
  CommentBodySchema,
} from "@/validation/schema/article";
import CommentForm from "./CommentForm";
import { extractImageUrls } from "@/lib/utils";
import ArticlesAPI from "@/api/article";
import useCommentsLoader from "@/hooks/useCommentsLoader";
import { UnauthorizedError } from "@/lib/http-errors";
import { useToast } from "../ui/use-toast";
import { revalidatePathData } from "@/lib/revalidate";

interface CreateCommentBoxProps {
  article: Article;
}

export default function CreateCommentBox({ article }: CreateCommentBoxProps) {
  const { setCommentList, setCommentCount } = useCommentsLoader();
  const { toast } = useToast();

  async function onCreateComment(comment: CommentBody) {
    const images = extractImageUrls(comment.body);

    try {
      const newComment = await ArticlesAPI.createComment(article._id, {
        body: comment.body,
        images,
      });

      setCommentList((prevCommentList) => [newComment, ...prevCommentList]);
      setCommentCount((prevCount) => prevCount + 1);

      revalidatePathData(`/articles/${article.slug}`);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        toast({
          title: "Unauthorized",
          description: "You need to login to article a comment",
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
      articleId={article._id}
      submitFunction={onCreateComment}
      height="10rem"
    />
  );
}
