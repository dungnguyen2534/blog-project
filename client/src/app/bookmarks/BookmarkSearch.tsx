"use client";

import { Input } from "@/components/ui/input";
import usePostsLoader from "@/hooks/usePostsLoader";
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
  const { setIsLoading, setPostList } = usePostsLoader();

  const [searchValue, setSearchValue] = useState(searchQuery);
  const searchQueryRef = useRef(searchQuery);

  const router = useRouter();

  function sanitizeInput(input?: string) {
    return input?.replace(/[^a-zA-Z0-9\s]/g, "") || "";
  }

  useEffect(() => {
    const query = encodeURIComponent(sanitizeInput(searchValue));
    if (searchQueryRef.current === query) return;
    setPostList([]);
    setIsLoading(true);

    const searchTimeout = setTimeout(() => {
      router.replace(
        `/bookmarks?${tag ? `tag=${tag}` : ""}${
          query ? `&searchQuery=${query}` : ""
        }`
      );
    }, 350);

    searchQueryRef.current = query;
    return () => clearTimeout(searchTimeout);
  }, [
    searchValue,
    router,
    tag,
    searchQuery,
    searchQueryRef,
    setIsLoading,
    setPostList,
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
