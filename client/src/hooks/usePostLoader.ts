import useSWR from "swr";
import PostsAPI from "@/api/post";

export default function usePostLoader() {
  const { data, isLoading, error } = useSWR(
    "posts",
    async () => await PostsAPI.getPostList(),
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  return {
    posts: data || [],
    isLoadingPosts: isLoading,
    isPostsLoadingError: error,
  };
}
