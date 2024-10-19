"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import usePostsLoader from "@/hooks/usePostsLoader";
import { useRouter, useSearchParams } from "next/navigation";

interface TagSelectorProps {
  className?: string;
}

export default function TagSelector({ className }: TagSelectorProps) {
  const { savedTagList, setPostList, setIsLoading } = usePostsLoader();

  const router = useRouter();
  const params = useSearchParams();
  const searchQuery = params.get("searchQuery");

  function onValueChange(value: string) {
    setIsLoading(true);
    setPostList([]);
    if (value === "All")
      return router.replace(
        `/bookmarks?${searchQuery ? `&searchQuery=${searchQuery}` : ""}`
      );
    router.replace(
      `/bookmarks?tag=${value}${
        searchQuery ? `&searchQuery=${searchQuery}` : ""
      }`
    );
  }

  return (
    <Select onValueChange={onValueChange} defaultValue="All">
      <SelectTrigger className={className}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="All" className="cursor-pointer">
          All tags
        </SelectItem>
        {savedTagList?.map((item, index) => (
          <SelectItem
            className="cursor-pointer"
            key={item + index}
            value={item}>
            #{item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
