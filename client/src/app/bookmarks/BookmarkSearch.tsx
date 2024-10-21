"use client";

import { Input } from "@/components/ui/input";
import useArticlesLoader from "@/hooks/useArticlesLoader";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface BookmarkSearchProps {
  tag?: string;
  searchQuery?: string;
  className?: string;
}

export default function BookmarkSearch({
  tag,
  searchQuery,
  className,
}: BookmarkSearchProps) {
  const { setIsLoading, setArticleList } = useArticlesLoader();

  const [searchValue, setSearchValue] = useState(searchQuery);

  const router = useRouter();

  function sanitizeInput(input?: string) {
    return input?.replace(/[^a-zA-Z0-9\s]/g, "") || "";
  }

  const searchQueryRef = useRef(sanitizeInput(searchQuery));
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const query = encodeURIComponent(sanitizeInput(searchValue));
    if (searchQueryRef.current === query) return;
    timeoutRef.current = setTimeout(() => {
      setArticleList([]);
      setIsLoading(true);

      router.replace(
        `/bookmarks?${tag ? `tag=${tag}` : ""}${
          query ? `&searchQuery=${query}` : ""
        }`
      );
    }, 350);

    searchQueryRef.current = query;
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    searchValue,
    router,
    tag,
    searchQuery,
    searchQueryRef,
    setIsLoading,
    setArticleList,
  ]);

  return (
    <Input
      className={className}
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
      placeholder="Search..."
    />
  );
}
