import PostsList from "@/components/posts/PostList";
import PostsAPI from "@/api/post";

export default async function Home() {
  const firstPage = await PostsAPI.getPostList();

  return (
    <main className="container px-2 sm:px-8 my-[1.05rem]">
      <PostsList firstPage={firstPage} />
    </main>
  );
}
