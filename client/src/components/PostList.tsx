import { Post } from "@/validation/schema/post";

interface PostList {
  posts: Post[];
}

export default function PostsList({ posts }: PostList) {
  return (
    <div>
      {posts.map((post) => (
        <div key={post._id}>{post.title}</div>
      ))}
    </div>
  );
}
