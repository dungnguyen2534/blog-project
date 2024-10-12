import UserAPI from "@/api/user";
import { NotFoundError } from "@/lib/http-errors";
import { notFound } from "next/navigation";
import { cache } from "react";
import Profile from "./Profile";
import PostsAPI from "@/api/post";
import { cookies } from "next/headers";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import PostsContextProvider from "@/context/PostsContext";

const getUser = cache(async (username: string, cookie?: RequestCookie) => {
  try {
    const user = await UserAPI.getUser(username, cookie);
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
  const cookieStore = cookies();
  const userCookie = cookieStore.get("connect.sid");

  const user = await getUser(username, userCookie);
  let userInitialPostsPage;
  try {
    userInitialPostsPage = await PostsAPI.getPostList(
      `/posts?authorId=${user._id}`,
      userCookie
    );
  } catch {
    userInitialPostsPage = undefined;
  }

  return (
    <PostsContextProvider
      initialPage={userInitialPostsPage}
      authorId={user._id}>
      <Profile user={user} />
    </PostsContextProvider>
  );
}
