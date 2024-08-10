import PostsAPI from "@/api/post";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { NotFoundError } from "@/lib/http-errors";
import { notFound } from "next/navigation";

interface PostPageProps {
  params: { slug: string };
}

// get all slugs for static render
export async function generateStaticParams() {
  const slugs = await PostsAPI.getSlugs();
  return slugs.map((slug) => ({ slug }));
}

async function getPost(slug: string) {
  try {
    return await PostsAPI.getPost(slug);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    } else {
      throw error;
    }
  }
}

export default async function PostPage({ params: { slug } }: PostPageProps) {
  const post = await getPost(slug);

  return (
    <div className="flex flex-col gap-5 xl:w-4/6 m-auto secondary-color p-5 rounded-md">
      <h1 className="text-5xl font-bold my-2">{post.title}</h1>
      <MarkdownRenderer>{post.body}</MarkdownRenderer>
    </div>
  );
}
