"use client";
import Link from "next/link";

interface ArticleTagsProps {
  tags?: string[];
  className?: string;
}

export default function ArticleTags({ tags, className }: ArticleTagsProps) {
  return (
    tags && (
      <div className={`mt-2 -ml-2 ${className}`}>
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/tags/${tag.replace("#", "")}`}
            className="text-sm font-semibold py-1 px-2 rounded-md transition-colors hover:bg-neutral-100 hover:dark:bg-neutral-800  break-words">
            {tag}
          </Link>
        ))}
      </div>
    )
  );
}
