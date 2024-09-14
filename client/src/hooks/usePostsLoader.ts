import PostsAPI from "@/api/post";
import { PostPage } from "@/validation/schema/post";
import useSWRInfinite from "swr/infinite";

export default function usePostsLoader(
  authorId: string = "",
  startPage?: number,
  limit: number = 12,
  tag: string = ""
) {
  const { data, size, isLoading, error, setSize } = useSWRInfinite(
    (pageIndex: number, previousPageData: PostPage) => {
      if (previousPageData && !previousPageData.posts.length) return null;

      return `/posts?tag=${tag}&authorId=${authorId}&page=${
        startPage ? startPage - 1 + pageIndex + 1 : pageIndex + 1 // start from startPage if it's provided (ssr)
      }&limit=${limit}`;
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
