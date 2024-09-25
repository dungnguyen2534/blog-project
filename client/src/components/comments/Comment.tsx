import type { Comment } from "@/validation/schema/post";
import MarkdownRenderer from "../MarkdownRenderer";
import UserAvatar from "../UserAvatar";
import CommentOptions from "./CommentOptions";

interface CommentProps {
  comment: Comment;
}

export default function Comment({ comment }: CommentProps) {
  return (
    <div className="flex gap-2 mb-5">
      <UserAvatar
        username={comment.author.username}
        profilePicUrl={comment.author.profilePicPath}
        className="mt-2 w-11 h-11"
      />
      <div className="flex-grow flex flex-col gap-[0.85rem] ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white dark:bg-neutral-900 mt-1 rounded-md w-fit px-5 overflow-hidden">
        <CommentOptions comment={comment} />
        <MarkdownRenderer>{comment.body}</MarkdownRenderer>
      </div>
    </div>
  );
}
