"use client";

import Comment from "./Comment";
import { CommentPage, Comment as CommentType } from "@/validation/schema/post";
import LoadingButton from "../LoadingButton";
import useCommentsLoader from "@/hooks/useCommentsLoader";

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
      {commentList.map((comment) => {
        return <Comment key={comment._id} comment={comment} />;
      })}

      {!initialPage.lastCommentReached &&
        !lastCommentReached &&
        !pageLoadError &&
        !(commentList.length === 0) && (
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
