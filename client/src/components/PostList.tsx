import { Post } from "@/validation/schema/post";
import MarkdownRenderer from "./MarkdownRenderer";

interface PostList {
  posts: Post[];
}

export default function PostsList({ posts }: PostList) {
  return (
    <div>
      {posts.map((post) => (
        <div key={post._id}>
          <div key={post._id}>{post.title}</div>
          <MarkdownRenderer>{post.body}</MarkdownRenderer>
        </div>
      ))}
    </div>
  );
}
