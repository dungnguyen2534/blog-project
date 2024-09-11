import PostsList from "@/components/posts/PostList";
import PostsAPI from "@/api/post";

export default async function Home() {
  const firstPage = await PostsAPI.getPostList();

  return (
    <main className="container px-0 sm:px-8 my-[0.35rem] sm:my-3">
      <PostsList firstPage={firstPage} />
    </main>
  );
}
