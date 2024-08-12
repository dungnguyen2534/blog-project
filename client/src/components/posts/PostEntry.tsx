import { User } from "@/validation/schema/user";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { formatDate } from "@/lib/utils";

interface PostEntryProps {
  title: string;
  body: string;
  summary?: string;
  slug: string;
  author: User;
  createdAt: string;
}

export default function PostEntry({
  title,
  summary,
  slug,
  author,
  createdAt,
}: PostEntryProps) {
  return (
    <article className="flex flex-col gap-2 secondary-color p-4 rounded-md shadow-sm ring-1 ring-neutral-100 dark:ring-neutral-900 overflow-hidden break-words">
      <Link
        href={"users/" + author.username}
        className="flex gap-2 items-center">
        <UserAvatar username={author.username} profilePicUrl="" />
        <div className="flex flex-col justify-center">
          <span className="text-sm">{author.username}</span>
          <time
            className="text-xs text-neutral-500 dark:text-neutral-400"
            dateTime={createdAt}>
            {formatDate(createdAt)}
          </time>
        </div>
      </Link>

      <Link href={`posts/${slug}`} className="flex flex-col gap-2">
        <h2 className="text-lg sm:text-2xl font-bold">{title}</h2>
        {summary && (
          <p className="line-clamp-3 break-words text-sm text-neutral-600 dark:text-neutral-400">
            {summary}
          </p>
        )}
      </Link>
    </article>
  );
}
