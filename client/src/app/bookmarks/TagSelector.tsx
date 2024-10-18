"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import usePostsLoader from "@/hooks/usePostsLoader";
import { useRouter } from "next/navigation";

interface TagSelectorProps {
  className?: string;
  placeholder: string;
}

export default function TagSelector({
  placeholder,
  className,
}: TagSelectorProps) {
  const router = useRouter();

  const { savedTagList } = usePostsLoader();

  function onValueChange(value: string) {
    if (value === "All") return router.replace(`/bookmarks`);
    router.replace(`/bookmarks?tag=${value}`);
  }

  return (
    <Select onValueChange={onValueChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
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
            {item}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
