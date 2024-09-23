import Link from "next/link";
import { Comment } from "@/validation/schema/post";
import MiniProfileProvider from "../MiniProfileProvider";
import { TooltipTrigger } from "../ui/tooltip";
import UserAvatar from "../UserAvatar";
import {
  calculateReadingTime,
  formatDate,
  formatUpdatedDate,
} from "@/lib/utils";
import post from "@/api/post";

interface CommentAuthorProps {
  comment: Comment;
}

export default function CommentAuthor({ comment }: CommentAuthorProps) {
  let commentDate;
  if (!(comment.createdAt !== comment.updatedAt)) {
    commentDate = (
      <time
        suppressHydrationWarning
        className="text-xs text-neutral-500 dark:text-neutral-400"
        dateTime={comment.createdAt}>
        {formatDate(comment.createdAt)}
      </time>
    );
  } else {
    commentDate = (
      <time
        suppressHydrationWarning
        className="text-xs text-neutral-500 dark:text-neutral-400"
        dateTime={comment.createdAt}>
        {`${formatDate(comment.createdAt, false)} - ${formatUpdatedDate(
          comment.updatedAt
        )}`}
      </time>
    );
  }

  const author = comment.author;
  return (
    <div className="my-2">
      <MiniProfileProvider author={author} customTrigger>
        <div className="relative flex">
          <TooltipTrigger asChild>
            <Link
              href={"/users/" + author.username}
              className="flex gap-[0.4rem] items-center">
              <span className="text-sm font-medium mb-5">
                {author.username}
              </span>
            </Link>
          </TooltipTrigger>
          <div className="text-nowrap text-xs text-neutral-500 dark:text-neutral-400 absolute bottom-0 left-0">
            {commentDate}
            {comment.createdAt !== comment.updatedAt && " • Edited"}
          </div>
        </div>
      </MiniProfileProvider>
    </div>
  );
}
