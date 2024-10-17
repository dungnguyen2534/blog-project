"use client";

import PostList from "@/components/posts/PostList";
import PostListSkeleton from "@/components/posts/PostListSkeleton";
import { Button } from "@/components/ui/button";
import useAuth from "@/hooks/useAuth";
import Link from "next/link";
import { FaSignInAlt } from "react-icons/fa";
import { TbMoodEmpty } from "react-icons/tb";

interface FollowedPageProps {
  target: "users" | "tags" | "all";
  noInitialPage: boolean;
}

export default function FollowedPage({
  target,
  noInitialPage,
}: FollowedPageProps) {
  const { user, isLoadingUser } = useAuth();

  let noFollowedContent;

  function noFollowedContentHandler(target: string) {
    return (
      <div className="mt-32 flex flex-col items-center gap-2">
        <TbMoodEmpty size={160} />
        <div className="text-xl">You aren&apos;t following {target}...</div>
      </div>
    );
  }

  if (target === "users") {
    user?.totalFollowing === 0
      ? (noFollowedContent = noFollowedContentHandler("anyone"))
      : null;
  } else if (target === "tags") {
    user?.followedTags.length === 0
      ? (noFollowedContent = noFollowedContentHandler("any tags"))
      : null;
  } else if (target === "all") {
    user?.totalFollowing === 0 &&
      user?.followedTags.length === 0 &&
      (noFollowedContent = noFollowedContentHandler("any people/tags"));
  } else {
    noFollowedContent = null;
  }

  return (
    <>
      {(!noInitialPage || user) && (
        <PostList key={"followed-posts"} followedTarget={target} />
      )}

      {noInitialPage && isLoadingUser && <PostListSkeleton skeletonCount={4} />}

      {noFollowedContent}

      {noInitialPage && !user && !isLoadingUser && (
        <div className="mt-32 flex flex-col items-center gap-2">
          <FaSignInAlt size={140} />
          <div>
            <div className="text-lg">Sign in to continue</div>
            <Button asChild className="w-full mt-2 ">
              <Link href={"/auth?signin"}> Sign in</Link>
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
