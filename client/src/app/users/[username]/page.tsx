import UserAPI from "@/api/user";
import UserAvatar from "@/components/UserAvatar";
import { NotFoundError } from "@/lib/http-errors";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";
import { cache } from "react";
import { RiCake2Line } from "react-icons/ri";

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
    title: user.username + " | BLOG-PROJECT",
  };
}

export default async function UserProfilePage({
  params: { username },
}: UserProfilePageProps) {
  const user = await getUser(username);

  return (
    <main className="secondary-container p-3 sm:my-4 sm:py-7 sm:p-7">
      <div className="flex gap-3 flex-col">
        <div className="flex items-center">
          <UserAvatar
            username={user.username}
            className="h-24 w-24 sm:w-36 sm:h-36"
          />
          <div className="w-full sm:text-lg flex items-center gap-5 justify-evenly ml-auto">
            <div className="flex flex-col items-center">
              0<span>posts</span>
            </div>
            <div className="flex flex-col items-center">
              0<span>follower</span>
            </div>
            <div className="flex flex-col items-center">
              0<span>following</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl mb-">{user.username}</h1>

          <p className="my-3">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Magnam
            accusantium voluptatum quam minima itaque quibusdam delectus maxime
            aliquid sed eligendi.
          </p>

          <time
            className="text-neutral-500 text-sm flex gap-1 items-center"
            dateTime={user.createdAt}>
            <RiCake2Line size={20} className="mb-1" /> Joined on{" "}
            {formatDate(user.createdAt, false)}
          </time>
        </div>
      </div>
    </main>
  );
}
