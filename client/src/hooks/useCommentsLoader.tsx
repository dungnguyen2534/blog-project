import PostsAPI from "@/api/post";
import { Comment as CommentType, CommentPage } from "@/validation/schema/post";
import { useCallback, useRef, useState } from "react";

interface useCommentsLoaderProps {
  postId: string;
  initialPage: CommentPage;
}

export default function useCommentsLoader({
  postId,
  initialPage,
}: useCommentsLoaderProps) {
  const [commentList, setCommentList] = useState<CommentType[]>(
    initialPage.comments
  );

  const [pageIndex, setPageIndex] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoadError, setPageLoadError] = useState(false);

  const pageIndexRef = useRef(pageIndex);
  pageIndexRef.current = pageIndex;

  // Either pass a url or limit and parentCommentId
  const fetchNextPage = useCallback(
    async (url?: string, limit?: number, parentCommentId?: string) => {
      if (url && (limit || parentCommentId))
        throw new Error(
          "Cannot use url and limit/parentCommentId at the same time"
        );

      setIsLoading(true);
      const query = `posts/${postId}/comments?${
        parentCommentId ? `parentCommentId=${parentCommentId}&` : ""
      }page=${pageIndexRef.current + 1}&limit=${limit}`;

      try {
        setPageIndex(pageIndexRef.current + 1);
        if (pageIndexRef.current >= initialPage.totalPages) return;

        const nextPage = await PostsAPI.getCommentList(postId, url || query);
        setCommentList((prevCommentList) => [
          ...prevCommentList,
          ...nextPage.comments,
        ]);
      } catch (error) {
        setIsLoading(false);
        setPageLoadError(true);
      } finally {
        setIsLoading(false);
      }
    },
    [postId, initialPage.totalPages]
  );

  return { commentList, fetchNextPage, pageIndex, isLoading, pageLoadError };
}
