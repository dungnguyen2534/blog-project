import PostsList from "@/components/posts/PostList";
import PostsAPI from "@/api/post";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = cookies();
  const userCookie = cookieStore.get("connect.sid");
  const initialPage = await PostsAPI.getPostList("/posts", userCookie);

  return (
    <main className="container px-0 md:px-8 my-[0.35rem] md:my-3">
      <PostsList initialPage={initialPage} />
    </main>
  );
}
