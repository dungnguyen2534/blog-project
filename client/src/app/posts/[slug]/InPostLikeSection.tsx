import PostsAPI from "@/api/post";
import InPostLike from "@/components/posts/InPostLike";
import { cookies } from "next/headers";

interface InPostLikeSectionProps {
  slug: string;
}

export default async function InPostLikeSection({
  slug,
}: InPostLikeSectionProps) {
  const userCookie = cookies().get("connect.sid");
  const post = await PostsAPI.getPost(slug, userCookie);

  return <InPostLike post={post} />;
}
