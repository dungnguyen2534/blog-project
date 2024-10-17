"use client";

import Link from "next/link";
import UserAvatar from "../UserAvatar";
import { Post } from "@/validation/schema/post";
import {
  calculateReadingTime,
  formatDate,
  formatUpdatedDate,
} from "@/lib/utils";
import { TooltipTrigger } from "@/components/ui/tooltip";
import MiniProfile from "../MiniProfile";

interface PostAuthorProps {
  post: Post;
  postEntry?: boolean;
}

export default function PostAuthor({ post, postEntry }: PostAuthorProps) {
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

  const author = post.author;
  return (
    <MiniProfile author={author} customTrigger>
      <div className="relative flex">
        <TooltipTrigger asChild>
          <Link
            href={"/users/" + author.username}
            className="flex gap-[0.4rem] items-center">
            <UserAvatar
              username={author.username}
              profilePicUrl={author.profilePicPath}
            />
            <span className="text-sm font-medium mb-5">{author.username}</span>
          </Link>
        </TooltipTrigger>
        <div className="text-nowrap text-xs text-neutral-500 dark:text-neutral-400 absolute bottom-0 left-11">
          {postDate}
          {!postEntry && (
            <span> • {calculateReadingTime(post.body)} min read </span>
          )}
        </div>
      </div>
    </MiniProfile>
  );
}
