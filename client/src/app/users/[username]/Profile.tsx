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

interface ProfileProps {
  user: User;
  userFirstPostPage: PostPage;
}

export default function Profile({ user, userFirstPostPage }: ProfileProps) {
  const { user: loggedInUser } = useAuth();

  const isLoggedInUser = loggedInUser?._id === user._id;

  return (
    <>
      <main className="secondary-container p-3 sm:mt-4 sm:p-7">
        <div className="relative flex gap-3 flex-col items-center">
          {loggedInUser && (
            <div className="absolute -top-4 -right-4">
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

          <div className="flex flex-col text-center">
            <h1 className="text-3xl">{user.username}</h1>

            {user.about && <p className="mt-3">{user.about}</p>}

            <time
              className="text-neutral-500 text-sm flex gap-1 items-center mt-4 justify-center"
              dateTime={user.createdAt}>
              <RiCake2Line size={20} className="mb-1" /> Joined on{" "}
              {formatDate(user.createdAt, false)}
            </time>
          </div>
        </div>
      </main>

      <div className="container px-0 my-2">
        <PostsList author={user} firstPage={userFirstPostPage} />
      </div>
    </>
  );
}
