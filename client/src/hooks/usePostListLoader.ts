import useSWR from "swr";
import PostsAPI from "@/api/post";

export default function usePostListLoader() {
  const { data, isLoading, error } = useSWR(
    "post_list",
    async () => await PostsAPI.getPostList(),
    {
      revalidateOnMount: true,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  return {
    posts: data || [],
    isLoadingPostList: isLoading,
    isLoadingPostListError: error,
  };
}
