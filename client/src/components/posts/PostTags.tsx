"use client";

import revalidateCachedData from "@/lib/revalidate";
import Link from "next/link";

interface PostTagsProps {
  tags?: string[];
  className?: string;
}

export default function PostTags({ tags, className }: PostTagsProps) {
  return (
    tags && (
      <div className={`mt-2 -ml-2 ${className}`}>
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/tags/${tag.replace("#", "")}`}
            onClick={() =>
              revalidateCachedData(`/tags/${tag.replace("#", "")}`)
            }
            className="text-sm font-semibold py-1 px-2 rounded-md transition-colors hover:bg-neutral-100 hover:dark:bg-neutral-800  break-words">
            {tag}
          </Link>
        ))}
      </div>
    )
  );
}
