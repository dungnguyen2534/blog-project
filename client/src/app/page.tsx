import PostsList from "@/components/posts/PostList";
import PostsAPI from "@/api/post";
import { cookies } from "next/headers";

export default async function Home() {
  const userCookie = cookies().get("connect.sid");
  let initialPage;
  try {
    initialPage = await PostsAPI.getPostList("/posts", userCookie);
  } catch {
    initialPage = undefined;
  }

  return (
    <main className="container px-0 md:px-8 my-[0.35rem] md:my-3">
      <PostsList initialPage={initialPage} />
    </main>
  );
}
