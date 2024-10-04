import PostsAPI from "@/api/post";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { NotFoundError } from "@/lib/http-errors";
import { notFound } from "next/navigation";
import { cache } from "react";
import PostOptions from "@/components/posts/PostOptions";
import CommentSection from "@/components/comments/CommentSection";
import PostTags from "@/components/posts/PostTags";
import { headers } from "next/headers";

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
  const referer = headers().get("referer");
  const previousUrl = referer ? new URL(referer).pathname : null;

  return (
    <article className="secondary-container md:my-[0.7rem] p-3 sm:pt-7 rounded-none sm:rounded-md">
      <div className="max-w-prose m-auto flex flex-col gap-2 break-words">
        <header>
          <h1 className="text-3xl sm:text-4xl font-black mt-2 mb-3">
            {post.title}
          </h1>
          <PostTags tags={post.tags} className="mb-3" />
          <PostOptions
            post={post}
            author={post.author}
            previousUrl={previousUrl}
          />
        </header>
        <div>
          <MarkdownRenderer>{post.body}</MarkdownRenderer>
        </div>
      </div>
      <span id="comment-section"></span>
      <CommentSection postId={post._id} />
    </article>
  );
}
