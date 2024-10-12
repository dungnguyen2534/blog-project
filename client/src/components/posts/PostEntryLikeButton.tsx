"use client";

import { useCallback, useState, useEffect } from "react";
import { Button } from "../ui/button";
import { PiHeart, PiHeartFill } from "react-icons/pi";
import PostsAPI from "@/api/post";
import usePostsLoader from "@/hooks/usePostsLoader";
import { useToast } from "../ui/use-toast";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

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

  useEffect(() => {
    setLikes(postsLikeCount.find((p) => p.postId === post._id)?.likeCount || 0);
  }, [postsLikeCount, post._id, post.likeCount]);

  const buttonContent = (
    <>
      {" "}
      {liked ? <PiHeartFill size={22} color="red" /> : <PiHeart size={22} />}
      {likes === 0 && "Like"}
      {likes > 0 && likes < 2 && `${likes} Like`}
      {likes >= 2 && `${likes} Likes`}
    </>
  );

  // conditionally using a link for the button to show the progress bar(only show when using next/link)
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <Button
        asChild={!liked}
        onClick={liked ? () => setOpenDialog(true) : handleClick}
        variant={variant}
        className={`gap-2 px-3 py-2 ${className}`}>
        {!liked ? (
          <Link href={`/posts/${post.slug}`}>{buttonContent}</Link>
        ) : (
          buttonContent
        )}
      </Button>
      <DialogContent aria-describedby="">
        <DialogHeader>
          <DialogTitle>Are you sure to unlike this post?</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => setOpenDialog(false)}>Turn back</Button>
          <Button
            onClick={unlikePost}
            className="bg-red-600 hover:!bg-red-700 text-white">
            Sure, unlike it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
