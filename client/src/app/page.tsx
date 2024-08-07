import PostsAPI from "@/api/post";
import PostList from "@/components/PostList";

export default async function Home() {
  const posts = await PostsAPI.getPosts();
  return (
    <div className="secondary-color p-4">
      <PostList posts={posts} />
    </div>
  );
}
