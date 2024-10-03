import React, { forwardRef, Ref } from "react";
import Link from "next/link";
import PostOptions from "./PostOptions";
import { Post } from "@/validation/schema/post";
import { BsChatSquare } from "react-icons/bs";
import { Button } from "../ui/button";
import PostTags from "./PostTags";
import LikeButton from "../LikeButton";

interface PostEntryProps {
  post: Post;
}

const PostEntry = forwardRef<HTMLElement, PostEntryProps>(({ post }, ref) => {
  return (
    <article
      ref={ref}
      className="secondary-container px-2 pt-3 !pb-1 sm:!pb-2 sm:p-4 w-full flex flex-col gap-2 rounded-none md:rounded-md shadow-sm ring-1 ring-neutral-100 dark:ring-neutral-900 overflow-hidden break-words">
      <PostOptions post={post} author={post.author} menuOnTop />

      <div className="md:ml-[2.85rem]">
        <Link href={`/posts/${post.slug}`} className="flex flex-col gap-2">
          <h2 className="text-lg sm:text-2xl font-bold">{post.title}</h2>
          {post.summary && (
            <p className="line-clamp-2 break-words text-sm text-neutral-600 dark:text-neutral-400">
              {post.summary}
            </p>
          )}
        </Link>
        <PostTags tags={post.tags} />
        <div className="mt-1 flex items-center gap-3 font-light text-sm">
          <LikeButton
            className="gap-2 px-3 py-2 -ml-3"
            variant="ghost"
            initialLikeCount={post.likeCount}
            targetId={post._id}
            targetType="post"
            isLoggedInUserLiked={post.isLoggedInUserLiked}
            loggedInUserLikedId={post.loggedInUserLikedId}
          />
          <Button asChild variant="ghost" className="gap-2 px-3 py-2 -ml-3">
            <Link href={`/posts/${post.slug}#comments`}>
              <BsChatSquare size={18} className="mt-[3px]" />{" "}
              {post.commentCount} Comments
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
});

PostEntry.displayName = "PostEntry";

export default PostEntry;
