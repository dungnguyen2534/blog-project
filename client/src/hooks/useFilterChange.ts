import usePostsLoader from "./usePostsLoader";
import revalidateCachedData from "@/lib/revalidate";

export default function useFilterChange() {
  const { setIsLoading, setPostList } = usePostsLoader();

  function onTriggerClick(path: string) {
    revalidateCachedData(path);
    setPostList([]);
    setIsLoading(true);
  }

  return onTriggerClick;
}
