import PostsAPI from "@/api/post";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import UserAvatar from "@/components/UserAvatar";
import { NotFoundError } from "@/lib/http-errors";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";

// using react cache to make sure the post is only fetched once
const getPost = cache(async (slug: string) => {
  try {
    return await PostsAPI.getPost(slug);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    } else {
      throw error;
    }
  }
});

interface PostPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const slugs = await PostsAPI.getSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params: { slug } }: PostPageProps) {
  const post = await getPost(slug);
  return {
    title: post.title,
    description: post.summary,
  };
}

export default async function PostPage({ params: { slug } }: PostPageProps) {
  const post = await getPost(slug);

  // for SEO, there should be only one h1 tag on a page
  // already hiding the h1 button in the editor, but double checking here in case user pastes markdown with h1
  const modifiedBody = post.body
    .replace(/^####\s/gm, "##### ")
    .replace(/^###\s/gm, "#### ")
    .replace(/^##\s/gm, "### ")
    .replace(/^#\s/gm, "## ")
    .replace(/\[(.*?)\]\(#(.*?)\)/gm, "[$1](#user-content-$2)");

  return (
    <article className="secondary-container sm:mt-4 sm:py-7 p-3">
      <div className="max-w-prose m-auto flex flex-col gap-2 overflow-hidden break-words">
        <header>
          <h1 className="text-3xl sm:text-4xl font-black my-2">{post.title}</h1>
          <Link
            href={"/users/" + post.author.username}
            className="flex gap-2 items-center mt-5">
            <UserAvatar username={post.author.username} profilePicUrl="" />
            <div className="flex flex-col justify-center">
              <span className="text-sm">{post.author.username}</span>
              <time
                className="text-xs text-neutral-500 dark:text-neutral-400"
                dateTime={post.createdAt}>
                {formatDate(post.createdAt)}
              </time>
            </div>
          </Link>
        </header>
        <section>
          <MarkdownRenderer>{modifiedBody}</MarkdownRenderer>
        </section>
      </div>
    </article>
  );
}
