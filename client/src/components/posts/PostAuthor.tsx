"use client";

import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { Post } from "@/validation/schema/post";
import {
  calculateReadingTime,
  formatDate,
  formatUpdatedDate,
} from "@/lib/utils";
import revalidateCachedData from "@/lib/revalidate";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "../ui/button";
import useAuth from "@/hooks/useAuth";

interface PostAuthorProps {
  post: Post;
}

export default function PostAuthor({ post }: PostAuthorProps) {
  const { user: LoggedInUser } = useAuth();

  let postDate;
  if (!(post.createdAt !== post.updatedAt)) {
    postDate = (
      <time
        suppressHydrationWarning
        className="text-xs text-neutral-500 dark:text-neutral-400"
        dateTime={post.createdAt}>
        {formatDate(post.createdAt)}
      </time>
    );
  } else {
    postDate = (
      <time
        suppressHydrationWarning
        className="text-xs text-neutral-500 dark:text-neutral-400"
        dateTime={post.createdAt}>
        {`${formatDate(post.createdAt, false)} - ${formatUpdatedDate(
          post.updatedAt
        )}`}
      </time>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <div className="relative flex">
          <TooltipTrigger asChild>
            <Link
              href={"/users/" + post.author.username}
              onClick={() =>
                revalidateCachedData("/users/" + post.author.username)
              }
              className="flex gap-[0.4rem] items-center">
              <UserAvatar
                username={post.author.username}
                profilePicUrl={post.author.profilePicPath}
              />
              <span className="text-sm font-medium mb-5">
                {post.author.username}
              </span>
            </Link>
          </TooltipTrigger>
          <div className="text-nowrap text-xs text-neutral-500 dark:text-neutral-400 absolute bottom-0 left-11">
            {postDate}
            <span> • {calculateReadingTime(post.body)} min read </span>
          </div>
        </div>
        <TooltipContent>
          <div className="w-56 py-1">
            <Link
              href={"/users/" + post.author.username}
              onClick={() =>
                revalidateCachedData("/users/" + post.author.username)
              }
              className="flex gap-[0.4rem] items-center mb-2">
              <UserAvatar
                username={post.author.username}
                profilePicUrl={post.author.profilePicPath}
              />
              <span className="text-sm font-medium">
                {post.author.username}
              </span>
            </Link>
            <div className="flex flex-col gap-2">
              {post.author._id !== LoggedInUser?._id && (
                <Button className="w-full">Follow</Button>
              )}

              <div>{post.author.about}</div>
              <div className="flex flex-col">
                <div className="font-semibold text-xs text-neutral-500 uppercase">
                  JOINED
                </div>
                <time suppressHydrationWarning dateTime={post.author.createdAt}>
                  {formatDate(post.author.createdAt, false)}
                </time>
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
