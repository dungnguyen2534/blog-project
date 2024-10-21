import useArticlesLoader from "./useArticlesLoader";
import { revalidateTagData } from "@/lib/revalidate";

export default function useFilterChange() {
  const { setIsLoading, setArticleList } = useArticlesLoader();

  function onTriggerClick(tag?: string) {
    tag && revalidateTagData(tag);
    setArticleList([]);
    setIsLoading(true);
  }

  return onTriggerClick;
}
