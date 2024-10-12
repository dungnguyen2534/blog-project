"use client";

import { Post } from "@/validation/schema/post";
import { Button } from "../ui/button";
import { BiShareAlt } from "react-icons/bi";
import { useToast } from "../ui/use-toast";
import InPostLikeButton from "./InPostLikeButton";

interface InPostLikeProps {
  post: Post;
}

export default function InPostLike({ post }: InPostLikeProps) {
  const { toast } = useToast();

  function handleCopyLink() {
    navigator.clipboard.writeText(
      `${window.location.origin}/posts/${post.slug}`
    );
    toast({
      title: "Post link copied to clipboard",
    });
  }

  return (
    <div className="flex gap-2 items-center justify-center  max-w-prose mx-auto ring-1 ring-neutral-300 dark:ring-0 dark:bg-neutral-950 rounded-md p-4 mt-5">
      {/* The id here is because when click the comment button on post entry, it will take to a perfect position to show comments */}
      <span id="comment-section" className="hidden sm:block">
        Do you like this post?
      </span>

      <InPostLikeButton variant="outline" post={post} className="ml-3" />
      <Button onClick={handleCopyLink} variant="outline" className="gap-2 ml-1">
        <BiShareAlt size={22} className="-ml-1" />
        <span>
          Share<span className="hidden sm:inline"> this post</span>
        </span>
      </Button>
    </div>
  );
}
