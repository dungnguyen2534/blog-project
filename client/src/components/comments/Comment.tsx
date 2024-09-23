import type { Comment } from "@/validation/schema/post";
import MarkdownRenderer from "../MarkdownRenderer";
import CommentAuthor from "./CommentAuthor";
import UserAvatar from "../UserAvatar";

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
      <div className="flex-grow ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white dark:bg-neutral-900 mt-1 rounded-md w-fit px-5 overflow-hidden">
        <CommentAuthor comment={comment} />
        <MarkdownRenderer>{comment.body}</MarkdownRenderer>
      </div>
    </div>
  );
}
