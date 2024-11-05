"use client";

import UserAvatar from "@/components/UserAvatar";
import useAuth from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import { User } from "@/validation/schema/user";
import ProfileEditor from "./ProfileEditor";
import { PiPencilLine } from "react-icons/pi";
import { BsPeople } from "react-icons/bs";
import FollowButton from "@/components/FollowButton";
import { useState } from "react";
import { LuCalendarCheck2 } from "react-icons/lu";
import ArticleList from "@/components/articles/ArticleList";

interface ProfileProps {
  user: User;
}

export default function Profile({ user }: ProfileProps) {
  const { user: loggedInUser } = useAuth();
  const [totalFollowers, setTotalFollowers] = useState(user.totalFollowers);
  const isLoggedInUser = loggedInUser?._id === user._id;

  return (
    <main className="mt-[4rem] md:!mt-[4.5rem]">
      <div className="secondary-container p-3 md:mt-[0.5rem] md:p-7 md:pb-5 rounded-none md:rounded-md main-outline">
        <div className="relative flex gap-3 flex-col md:items-center">
          {loggedInUser && (
            <div className="absolute top-1 right-1 md:-top-4 md:-right-4">
              {isLoggedInUser ? (
                <ProfileEditor user={user} />
              ) : (
                <FollowButton
                  userId={user._id}
                  isLoggedInUserFollowing={user.isLoggedInUserFollowing}
                  totalFollowers={totalFollowers}
                  setTotalFollowers={setTotalFollowers}
                  variant="outline"
                />
              )}
            </div>
          )}

          <UserAvatar
            priority
            username={user.username}
            profilePicUrl={user.profilePicPath}
            className="h-28 w-28 sm:w-36 sm:h-36"
            width={144}
            height={144}
          />

          <div className="flex flex-col gap-2 md:text-center">
            <h1 className="text-2xl sm:text-3xl">{user.username}</h1>

            {user.about && (
              <p className="ml-[0.125rem] sm:ml-0 my-1">{user.about}</p>
            )}

            <div className="h-[1px] w-full bg-[#f2f2f2] dark:bg-neutral-800"></div>

            <div className="flex gap-4 mt-1 text-sm items-center md:justify-around">
              <div className="text-muted-foreground flex gap-1 items-center md:justify-center ml-[0.05rem] sm:ml-0">
                <PiPencilLine size={21} className="mb-1" />
                {user.totalArticles}{" "}
                {user.totalArticles !== 1 ? "Articles" : "Article"}
              </div>

              <div className="text-muted-foreground flex gap-1 items-center md:justify-center ml-1">
                <BsPeople size={20} className="mb-1" />
                {totalFollowers}{" "}
                {totalFollowers !== 1 ? "Followers" : "Follower"}
              </div>

              <time
                className="flex text-muted-foreground gap-1 items-center md:justify-center"
                dateTime={user.createdAt}>
                <LuCalendarCheck2 size={18} className="mb-1" />
                Joined {formatDate(user.createdAt, false)}
              </time>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-0 my-1 md:my-2">
        <ArticleList author={user} key={user._id} />
      </div>
    </main>
  );
}
