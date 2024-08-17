import PostsAPI from "@/api/post";
import { NotFoundError } from "@/lib/http-errors";
import { Post } from "@/validation/schema/post";
import { notFound } from "next/navigation";
import UpdatePost from "./updatePost";

interface UpdatePostPageProps {
  params: { slug: string };
}

export default async function UpdatePostPage({
  params: { slug },
}: UpdatePostPageProps) {
  let post: Post;

  try {
    post = await PostsAPI.getPost(slug);
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    } else {
      throw error;
    }
  }
  return <UpdatePost post={post} />;
}
