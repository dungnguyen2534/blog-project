import { Post } from "@/validation/schema/post";
import PostEntry from "./PostEntry";

interface PostList {
  posts: Post[];
}

export default function PostsList({ posts }: PostList) {
  return (
    <div className="flex flex-col gap-3 xl:w-7/12 m-auto">
      {posts.map((post) => (
        <PostEntry
          key={post._id}
          {...post}
          slug={`${post.slug}-${post.slugId}`}
        />
      ))}
    </div>
  );
}
