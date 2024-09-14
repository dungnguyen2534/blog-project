import UserAPI from "@/api/user";
import { NotFoundError } from "@/lib/http-errors";
import { notFound } from "next/navigation";
import { cache } from "react";
import Profile from "./Profile";
import PostsAPI from "@/api/post";

const getUser = cache(async (username: string) => {
  try {
    const user = await UserAPI.getUser(username);
    return user;
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    } else {
      throw error;
    }
  }
});

interface UserProfilePageProps {
  params: { username: string };
}

export async function generateMetadata({
  params: { username },
}: UserProfilePageProps) {
  const user = await getUser(username);
  return {
    title: user.username + " | Devdaily",
  };
}

export default async function UserProfilePage({
  params: { username },
}: UserProfilePageProps) {
  const user = await getUser(username);
  const firstPostPage = await PostsAPI.getPostList(
    `/posts?authorId=${user._id}`
  );

  return <Profile user={user} userFirstPostPage={firstPostPage} />;
}
