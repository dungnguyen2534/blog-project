import PostsAPI from "@/api/post";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { NotFoundError } from "@/lib/http-errors";
import { notFound } from "next/navigation";
import { cache } from "react";
import PostOptions from "@/components/posts/PostOptions";

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
    .replace(/\[(.*?)\]\(#(.*?)\)/gm, "[$1](#user-content-$2)"); // prefix header for table of contents

  return (
    <article className="secondary-container sm:my-4 sm:py-7 p-3">
      <div className="max-w-prose m-auto flex flex-col gap-2 break-words">
        <header>
          <h1 className="text-3xl sm:text-4xl font-black mt-2 mb-3">
            {post.title}
          </h1>
          <PostOptions post={post} author={post.author} />
        </header>
        <section>
          <MarkdownRenderer>{modifiedBody}</MarkdownRenderer>
        </section>
      </div>
    </article>
  );
}
