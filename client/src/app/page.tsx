import PostsList from "@/components/posts/PostList";
import PostsAPI from "@/api/post";
import PostsContextProvider from "@/context/PostsContext";

export default async function Home() {
  const initialPage = await PostsAPI.getPostList();

  return (
    <main className="container px-0 md:px-8 my-[0.35rem] md:my-3">
      <PostsList initialPage={initialPage} />
    </main>
  );
}
