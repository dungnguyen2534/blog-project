"use client";

import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import useAuth from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import { User } from "@/validation/schema/user";
import { RiCake2Line } from "react-icons/ri";
import ProfileEditor from "./ProfileEditor";
import env from "@/validation/env-validation";

interface ProfileProps {
  user: User;
}

export default function Profile({ user }: ProfileProps) {
  const { user: loggedInUser } = useAuth();

  const isLoggedInUser = loggedInUser?._id === user._id;

  return (
    <main className="secondary-container p-3 sm:my-4 sm:p-7">
      <div className="relative flex gap-3 flex-col">
        {loggedInUser && (
          <div className="absolute -top-4 -right-4">
            {isLoggedInUser ? (
              <ProfileEditor user={user} />
            ) : (
              <Button variant="outline">Follow</Button>
            )}
          </div>
        )}

        <div className="flex items-center">
          <UserAvatar
            username={user.username}
            profilePicUrl={env.NEXT_PUBLIC_SERVER_URL + user.profilePicPath}
            className="h-24 w-24 sm:w-36 sm:h-36"
          />
          <div className="w-full sm:text-lg flex items-center gap-5 -ml-5">
            <div className="flex flex-col items-center w-[45%] border-r-2">
              0<span className="text-sm uppercase">POSTS</span>
            </div>
            <div className="flex flex-col items-center w-[45%]">
              0<span className="text-sm uppercase">FOLLOWER</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl">{user.username}</h1>

          {user.about && <p className="mt-3 mb-2">{user.about}</p>}

          <time
            className="text-neutral-500 text-sm flex gap-1 items-center mt-2"
            dateTime={user.createdAt}>
            <RiCake2Line size={20} className="mb-1" /> Joined on{" "}
            {formatDate(user.createdAt, false)}
          </time>
        </div>
      </div>
    </main>
  );
}
