import UserAPI from "@/api/user";
import { NotFoundError } from "@/lib/http-errors";
import { notFound } from "next/navigation";
import { cache } from "react";
import Profile from "./Profile";
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
  const user = await getUser(username);

  return (
    <ArticlesContextProvider authorId={user._id}>
      <Profile user={user} />
    </ArticlesContextProvider>
  );
}
