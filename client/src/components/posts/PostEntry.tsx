"use client";

import React, { forwardRef, Ref, useCallback, useRef, useState } from "react";
import Link from "next/link";
import PostOptions from "./PostOptions";
import { Post } from "@/validation/schema/post";
import { IoChatboxOutline } from "react-icons/io5";
import { Button } from "../ui/button";
import PostTags from "./PostTags";
import PostEntryLikeButton from "./PostEntryLikeButton";
import { calculateReadingTime } from "@/lib/utils";
import { MdBookmarkAdded, MdOutlineBookmarkAdd } from "react-icons/md";
import useAuth from "@/hooks/useAuth";
import PostsAPI from "@/api/post";
import { useToast } from "../ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface PostEntryProps {
  post: Post;
}

const PostEntry = forwardRef<HTMLElement, PostEntryProps>(({ post }, ref) => {
  const [isSaved, setIsSaved] = useState(post.isSavedPost);

  const { user } = useAuth();
  const { toast } = useToast();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const bookmark = useCallback(async () => {
    if (!user) {
      toast({
        title: "Please sign in to bookmark this post",
      });
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const newIsSaved = !isSaved;
    setIsSaved(newIsSaved);

    timeoutRef.current = setTimeout(async () => {
      try {
        if (isSaved) {
          await PostsAPI.unsavePost(post._id);
        } else {
          await PostsAPI.savePost(post._id);
        }
        toast({
          title: isSaved ? "Post removed from bookmarks" : "Post bookmarked",
        });
      } catch {
        setIsSaved(!newIsSaved);
        toast({
          title: "An error occurred",
          description: "Please try again later",
        });
      }
    }, 300);
  }, [isSaved, post._id, toast, user]);

  return (
    <article
      ref={ref}
      className="secondary-container px-4 pt-3 !pb-1 sm:!pb-2 md:p-4 w-full flex flex-col gap-2 rounded-none md:rounded-md ring-1 ring-[#f1f1f1] dark:ring-neutral-900 overflow-hidden break-words">
      <PostOptions post={post} author={post.author} menuOnTop postEntry />

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
        <div className="mt-2 sm:mt-1 flex items-center justify-between font-light text-sm">
          <div className="flex items-center gap-3">
            <PostEntryLikeButton
              post={post}
              className="-ml-3"
              variant="ghost"
            />
            <Button asChild variant="ghost" className="gap-1 px-3 py-2 -ml-3">
              <Link href={`/posts/${post.slug}#comment-section`}>
                <IoChatboxOutline size={22} className="mt-[0.14rem]" />
                <span>{post.commentCount > 0 && post.commentCount}</span>
                <span className={`hidden sm:block `}>
                  {post.commentCount <= 1 ? "Comment" : "Comments"}
                </span>
              </Link>
            </Button>
          </div>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-muted-foreground cursor-pointer hover:text-black dark:hover:text-white items-center gap-1 -mr-1 px-3"
                  onClick={bookmark}>
                  <span className="font-medium text-xs">
                    {calculateReadingTime(post.body)} min read
                  </span>
                  {isSaved ? (
                    <MdBookmarkAdded size={19} />
                  ) : (
                    <MdOutlineBookmarkAdd size={19} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Bookmark</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </article>
  );
});

PostEntry.displayName = "PostEntry";

export default PostEntry;
