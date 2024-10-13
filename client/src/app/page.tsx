import PostList from "@/components/posts/PostList";
import PostsAPI from "@/api/post";
import { cookies } from "next/headers";
import PostsContextProvider from "@/context/PostsContext";
import PostListTabs from "@/components/posts/PostListTabs";

export default async function Home() {
  const userCookie = cookies().get("connect.sid");
  let initialPage;
  try {
    initialPage = await PostsAPI.getPostList("/posts", userCookie);
  } catch {
    initialPage = undefined;
  }

  return (
    <PostsContextProvider initialPage={initialPage}>
      <main className="container px-0 md:px-8 my-[0.35rem] md:my-3">
        <PostListTabs defaultValue="Latest">
          <PostList />
        </PostListTabs>
      </main>
    </PostsContextProvider>
  );
}
