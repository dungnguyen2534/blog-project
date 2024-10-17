"use client";

import { useCallback, useState, useEffect } from "react";
import { Button } from "../ui/button";
import { PiHeart, PiHeartFill } from "react-icons/pi";
import PostsAPI from "@/api/post";
import usePostsLoader from "@/hooks/usePostsLoader";
import { useToast } from "../ui/use-toast";
import { Post } from "@/validation/schema/post";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import Link from "next/link";

interface PostEntryLikeButtonProps {
  post: Post;
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null
    | undefined;
}

export default function PostEntryLikeButton({
  post,
  className,
  variant,
}: PostEntryLikeButtonProps) {
  const { postsLikeCount, setPostsLikeCount } = usePostsLoader();

  const [liked, setLiked] = useState(post.isLoggedInUserLiked);
  const [likes, setLikes] = useState(
    postsLikeCount.find((p) => p.postId === post._id)?.likeCount || 0
  );

  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();

  function handleClick() {
    if (!liked) {
      toast({
        title: "You can like the post after reading it",
      });
    }
  }

  const unlikePost = useCallback(async () => {
    try {
      const newLikeCount = (await PostsAPI.unlike(post._id, "post")).totalLikes;

      setPostsLikeCount((prevCounts) =>
        prevCounts.map((p) =>
          p.postId === post._id
            ? {
                ...p,
                likeCount: newLikeCount,
              }
            : p
        )
      );

      setLiked(false);
      setLikes((prevLikes) => prevLikes - 1);
      setOpenDialog(false);
    } catch {
      toast({
        title: "An error occurred, please try again later",
      });
    }
  }, [post._id, setPostsLikeCount, toast]);

  const buttonContent = (
    <>
      {liked ? (
        <PiHeartFill size={23} color="red" className="mb-[0.1rem]" />
      ) : (
        <PiHeart size={23} className="mb-[0.1rem]" />
      )}
      {likes > 0 && <span>{likes}</span>}
      <span className="hidden sm:block">{likes <= 1 ? "Like" : "Likes"}</span>
    </>
  );

  // conditionally using a link for the button to show the progress bar(only show when using next/link)
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      {likes > 0 ? (
        <Button
          asChild={!liked}
          onClick={liked ? () => setOpenDialog(true) : handleClick}
          variant={variant}
          className={`gap-1 px-3 py-2 ${className}`}>
          {!liked ? (
            <Link href={`/posts/${post.slug}`}>{buttonContent}</Link>
          ) : (
            buttonContent
          )}
        </Button>
      ) : (
        <Button
          asChild={!liked}
          onClick={liked ? () => setOpenDialog(true) : handleClick}
          variant={variant}
          className={`gap-1 px-3 py-2 sm:hidden ${className}`}>
          {!liked ? (
            <Link href={`/posts/${post.slug}`}>{buttonContent}</Link>
          ) : (
            buttonContent
          )}
        </Button>
      )}

      <DialogContent aria-describedby="">
        <DialogHeader>
          <DialogTitle>Unlike this post?</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => setOpenDialog(false)}>Turn back</Button>
          <Button
            onClick={unlikePost}
            className="bg-red-600 hover:!bg-red-700 text-white">
            Unlike it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
