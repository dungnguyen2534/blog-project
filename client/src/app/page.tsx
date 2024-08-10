import PostsAPI from "@/api/post";
import PostList from "@/components/PostList";
import { PiSmileyMeltingFill } from "react-icons/pi";

export default async function Home() {
  const posts = await PostsAPI.getPostList();

  return (
    <>
      {posts?.length === 0 ? (
        <div className="flex flex-col gap-2 items-center justify-center mt-48">
          <PiSmileyMeltingFill
            size={80}
            className="text-neutral-700 dark:text-white"
          />
          <h1 className="font-medium">No one has posted yet, be the first!</h1>
        </div>
      ) : (
        <PostList posts={posts} />
      )}
    </>
  );
}
