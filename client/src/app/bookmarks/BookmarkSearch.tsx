"use client";

import tag from "@/api/tag";
import { Input } from "@/components/ui/input";
import useArticlesLoader from "@/hooks/useArticlesLoader";
import { sanitizeInput } from "@/lib/utils";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface BookmarkSearchProps {
  searchQuery?: string;
  className?: string;
}

export default function BookmarkSearch({
  searchQuery,
  className,
}: BookmarkSearchProps) {
  const { setIsLoading, setArticleList } = useArticlesLoader();
  const [searchValue, setSearchValue] = useState(searchQuery || "");

  const router = useRouter();

  const searchQueryRef = useRef(sanitizeInput(searchQuery));
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const query = encodeURIComponent(sanitizeInput(searchValue));
    if (searchQueryRef.current === query) return;
    timeoutRef.current = setTimeout(() => {
      setIsLoading(true);
      router.replace(`/bookmarks?searchQuery=${query}`);
    }, 500);

    searchQueryRef.current = query;
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [
    searchValue,
    router,
    searchQuery,
    searchQueryRef,
    setIsLoading,
    setArticleList,
  ]);

  return (
    <div className={`relative w-full ${className}`}>
      <Input
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        placeholder="Search..."
      />
    </div>
  );
}
