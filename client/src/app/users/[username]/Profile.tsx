"use client";

import { Button } from "@/components/ui/button";
import UserAvatar from "@/components/UserAvatar";
import useAuth from "@/hooks/useAuth";
import { formatDate } from "@/lib/utils";
import { User } from "@/validation/schema/user";
import { RiCake2Line } from "react-icons/ri";
import ProfileEditor from "./ProfileEditor";
import PostsList from "@/components/posts/PostList";
import { PostPage } from "@/validation/schema/post";
import { TfiWrite } from "react-icons/tfi";
import { BsPeople } from "react-icons/bs";

interface ProfileProps {
  user: User;
  userInitialPostsPage?: PostPage;
}

export default function Profile({ user, userInitialPostsPage }: ProfileProps) {
  const { user: loggedInUser } = useAuth();

  const isLoggedInUser = loggedInUser?._id === user._id;

  return (
    <>
      <main className="secondary-container p-3 md:mt-[0.7rem] sm:p-7 rounded-none md:rounded-md">
        <div className="relative flex gap-3 flex-col md:items-center">
          {loggedInUser && (
            <div className="absolute top-1 right-1 md:-top-4 md:-right-4">
              {isLoggedInUser ? (
                <ProfileEditor user={user} />
              ) : (
                <Button variant="outline">Follow</Button>
              )}
            </div>
          )}

          <UserAvatar
            username={user.username}
            profilePicUrl={user.profilePicPath}
            className="h-24 w-24 sm:w-36 sm:h-36"
          />

          <div className="flex flex-col gap-2 md:text-center">
            <h1 className="text-3xl">{user.username}</h1>

            {user.about && (
              <p className="ml-[0.125rem] sm:ml-0 my-1">{user.about}</p>
            )}

            <div className="h-[1px] w-full bg-neutral-200 dark:bg-neutral-700"></div>

            <div className="flex gap-4 mt-1 md:justify-around">
              <div className="text-muted-foreground text-sm flex gap-1 items-center md:justify-center ml-[0.05rem] sm:ml-0">
                <TfiWrite size={18} className="mb-[0.1rem]" />
                {user.totalPosts} {user.totalPosts !== 1 ? "Posts" : "Post"}{" "}
                written
              </div>

              <div className="text-muted-foreground text-sm flex gap-1 items-center md:justify-center">
                <BsPeople size={20} className="mb-[0.1rem]" />
                {user.totalFollowers}{" "}
                {user.totalFollowers !== 1 ? "Followers" : "Follower"}
              </div>

              <time
                className="flex text-muted-foreground text-sm gap-1 items-center md:justify-center"
                dateTime={user.createdAt}>
                <RiCake2Line size={20} className="mb-1" /> Joined{" "}
                {formatDate(user.createdAt, false)}
              </time>
            </div>
          </div>
        </div>
      </main>

      <div className="container px-0 my-[0.35rem] md:my-2">
        <PostsList author={user} initialPage={userInitialPostsPage} />
      </div>
    </>
  );
}
