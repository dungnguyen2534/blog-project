"use client";

import Comment from "./Comment";
import { CommentPage } from "@/validation/schema/post";
import LoadingButton from "../LoadingButton";
import useCommentsLoader from "@/hooks/useCommentsLoader";
import { useState } from "react";

interface CommentListProps {
  initialPage: CommentPage;
}

export default function CommentList({ initialPage }: CommentListProps) {
  const {
    commentList,
    fetchNextPage,
    isLoading,
    lastCommentReached,
    pageLoadError,
  } = useCommentsLoader();

  return (
    <>
      {initialPage &&
        commentList.map((comment) => (
          <Comment key={comment._id} comment={comment} />
        ))}

      {!initialPage.lastCommentReached &&
        !lastCommentReached &&
        !pageLoadError && (
          <div className="ml-[3.1rem] mt-5">
            <LoadingButton
              className="w-full"
              variant="secondary"
              text="Load more comments"
              loading={isLoading}
              onClick={() => fetchNextPage(undefined, 2)}
            />
          </div>
        )}
    </>
  );
}
