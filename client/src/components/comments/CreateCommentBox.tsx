"use client";

import { Article, CommentBody } from "@/validation/schema/article";
import CommentForm from "./CommentForm";
import { extractImageUrls } from "@/lib/utils";
import ArticlesAPI from "@/api/article";
import useCommentsLoader from "@/hooks/useCommentsLoader";
import { UnauthorizedError } from "@/lib/http-errors";
import { useToast } from "../ui/use-toast";
import { revalidatePathData } from "@/lib/revalidate";
import useArticlesLoader from "@/hooks/useArticlesLoader";
import { useEffect, useState } from "react";

interface CreateCommentBoxProps {
  article: Article;
}

export default function CreateCommentBox({ article }: CreateCommentBoxProps) {
  const { setCommentList, setCommentCount, commentCount } = useCommentsLoader();
  const { articleList, setArticleList } = useArticlesLoader();
  const { toast } = useToast();

  const [updatedComments, setUpdatedComments] = useState(false);

  useEffect(() => {
    if (updatedComments) {
      const articleIndex = articleList.findIndex((a) => a._id === article._id);

      if (articleIndex !== -1) {
        const updatedArticleList = [...articleList];
        updatedArticleList[articleIndex].commentCount = commentCount;
        setArticleList(updatedArticleList);
      }

      setUpdatedComments(false);
    }
  }, [updatedComments, commentCount, article._id, articleList, setArticleList]);

  async function onCreateComment(comment: CommentBody) {
    const images = extractImageUrls(comment.body);

    try {
      const newComment = await ArticlesAPI.createComment(article._id, {
        body: comment.body,
        images,
      });

      setCommentList((prevCommentList) => [newComment, ...prevCommentList]);
      setCommentCount((prevCount) => prevCount + 1);
      setUpdatedComments(true);
      revalidatePathData("/articles/" + article.slug);
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
