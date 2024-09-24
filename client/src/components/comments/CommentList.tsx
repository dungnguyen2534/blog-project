"use client";

import Comment from "./Comment";
import { CommentPage } from "@/validation/schema/post";
import LoadingButton from "../LoadingButton";
import useCommentsLoader from "@/hooks/useCommentsLoader";

interface CommentListProps {
  initialPage: CommentPage;
}

export default function CommentList({ initialPage }: CommentListProps) {
  const { commentList, fetchNextPage, pageIndex, isLoading, pageLoadError } =
    useCommentsLoader();

  return (
    <>
      {initialPage &&
        commentList.map((comment) => (
          <Comment key={comment._id} comment={comment} />
        ))}

      {pageIndex < initialPage.totalPages && !pageLoadError && (
        <div className="ml-[3.1rem]">
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
