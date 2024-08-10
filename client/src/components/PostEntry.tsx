import Link from "next/link";

interface PostEntryProps {
  title: string;
  body: string;
  summary?: string;
  slug: string;
}

export default function PostEntry({ title, summary, slug }: PostEntryProps) {
  return (
    <article className="secondary-color p-4 rounded-md shadow-sm ring-1 ring-neutral-200 dark:ring-neutral-800">
      <Link href={slug} className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        {summary && (
          <p className="line-clamp-3 text-sm text-neutral-700 dark:text-neutral-300">
            {summary}
          </p>
        )}
      </Link>
    </article>
  );
}
