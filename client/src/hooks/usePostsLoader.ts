import PostsAPI from "@/api/post";
import { PostPage } from "@/validation/schema/post";
import useSWRInfinite from "swr/infinite";

export default function usePostsLoader(
  authorId: string = "",
  limit: number = 12
) {
  const { data, size, isLoading, error, setSize } = useSWRInfinite(
    (pageIndex: number, previousPageData: PostPage) => {
      if (previousPageData && !previousPageData.posts.length) return null;
      return `/posts?authorId=${authorId}&page=${pageIndex + 1}&limit=${limit}`;
    },
    PostsAPI.getPostList
  );

  return {
    pages: data || [], // pages is an array of page
    pageToLoad: size,
    setPageToLoad: setSize,
    isLoadingPage: isLoading,
    isLoadingPageError: error,
  };
}
