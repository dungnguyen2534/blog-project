import UserAPI from "@/api/user";
import { NotFoundError } from "@/lib/http-errors";
import { notFound } from "next/navigation";
import { cache } from "react";
import Profile from "./Profile";
import ArticlesAPI from "@/api/article";
import { cookies } from "next/headers";
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import ArticlesContextProvider from "@/context/ArticlesContext";

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
    title: user.username + " | Devflow",
  };
}

export default async function UserProfilePage({
  params: { username },
}: UserProfilePageProps) {
  const cookieStore = cookies();
  const userCookie = cookieStore.get("connect.sid");

  const user = await getUser(username, userCookie);
  let userInitialArticlesPage;
  try {
    userInitialArticlesPage = await ArticlesAPI.getArticleList(
      `/articles?authorId=${user._id}`,
      userCookie
    );
  } catch {
    userInitialArticlesPage = undefined;
  }

  return (
    <ArticlesContextProvider
      initialPage={userInitialArticlesPage}
      authorId={user._id}>
      <Profile user={user} />
    </ArticlesContextProvider>
  );
}
