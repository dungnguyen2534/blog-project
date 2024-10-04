import PostsAPI from "@/api/post";
import PostsList from "@/components/posts/PostList";
import { Button } from "@/components/ui/button";
import { NotFoundError } from "@/lib/http-errors";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

interface TagPageProps {
  params: { tag: string };
}

export async function generateMetadata({ params: { tag } }: TagPageProps) {
  const capitalizedTag = tag.charAt(0).toUpperCase() + tag.slice(1);
  return {
    title: capitalizedTag + " - Devdaily",
  };
}

export default async function TagPage({ params: { tag } }: TagPageProps) {
  const cookieStore = cookies();
  const userCookie = cookieStore.get("connect.sid");

  let initialPage;
  try {
    initialPage = await PostsAPI.getPostList(`/posts?tag=${tag}`, userCookie);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    } else {
      initialPage = undefined;
    }
  }

  return (
    <main className="container px-0 sm:px-8 my-[0.3rem] sm:my-3">
      {/* TODO: Tags pool, put this to a separate component */}
      <div className="secondary-container rounded-none md:rounded-md bg-white dark:bg-neutral-900 flex p-5 mb-1 sm:mb-[0.35rem] items-center justify-between">
        <h1 className="font-bold text-3xl">{"#" + tag}</h1>
        <div>
          <Button variant="outline">Follow</Button>
          <Button variant="ghost" className="ml-2">
            Hide
          </Button>
        </div>
      </div>

      <PostsList tag={tag} initialPage={initialPage} />
    </main>
  );
}
