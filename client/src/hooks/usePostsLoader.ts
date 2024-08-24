import PostsAPI from "@/api/post";
import { PostPage } from "@/validation/schema/post";
import useSWRInfinite from "swr/infinite";

export default function usePostsLoader(limit: number = 12) {
  const { data, size, isLoading, error, setSize } = useSWRInfinite(
    (pageIndex: number, previousPageData: PostPage) => {
      if (previousPageData && !previousPageData.posts.length) return null;
      return `/posts?page=${pageIndex + 1}&limit=${limit}`;
    },
    PostsAPI.getPostList
  );

  return {
    pages: data || [],
    pageToLoad: size,
    setPageToLoad: setSize,
    isLoadingPage: isLoading,
    isLoadingPageError: error,
  };
}
