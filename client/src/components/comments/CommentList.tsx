"use client";

import Comment from "./Comment";
import LoadingButton from "../LoadingButton";
import useCommentsLoader from "@/hooks/useCommentsLoader";
import { Article } from "@/validation/schema/article";

interface CommentListProps {
  article: Article;
}

export default function CommentList({ article }: CommentListProps) {
  const {
    commentList,
    fetchNextPage,
    isLoading,
    lastCommentReached,
    pageLoadError,
  } = useCommentsLoader();

  return (
    <>
      {commentList.map((comment) => {
        return (
          <Comment key={comment._id} comment={comment} article={article} />
        );
      })}

      {!lastCommentReached && !pageLoadError && !(commentList.length === 0) && (
        <div className="ml-[3.1rem] mt-5">
          <LoadingButton
            className="w-full"
            variant="secondary"
            text="Load more comments"
            loading={isLoading}
            onClick={() =>
              fetchNextPage(12, commentList[commentList.length - 1]._id)
            }
          />
        </div>
      )}
    </>
  );
}
