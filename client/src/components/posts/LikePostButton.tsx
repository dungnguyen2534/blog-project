"use client";

import { useCallback, useState, useRef, useEffect, use } from "react";
import { Button } from "../ui/button";
import { PiHeart, PiHeartFill } from "react-icons/pi";
import PostsAPI from "@/api/post";
import useAuth from "@/hooks/useAuth";
import usePostsLoader from "@/hooks/usePostsLoader";
import useAuthDialogs from "@/hooks/useAuthDialogs";
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
import { Description } from "@radix-ui/react-toast";

interface LikePostButtonProps {
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
  postEntry?: boolean;
}

export default function LikePostButton({
  post,
  className,
  variant,
  postEntry,
}: LikePostButtonProps) {
  const { postsLikeCount, setPostsLikeCount } = usePostsLoader();

  const [liked, setLiked] = useState(post.isLoggedInUserLiked);
  const [likes, setLikes] = useState(
    postsLikeCount.find((p) => p.postId === post._id)?.likeCount ||
      post.likeCount ||
      0
  );

  const [openDialog, setOpenDialog] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { user } = useAuth();
  const { showSignIn } = useAuthDialogs();
  const { toast } = useToast();
  const router = useRouter();

  const handleClick = useCallback(async () => {
    if (!user) {
      showSignIn();
      return;
    }

    if (!user.username) return;

    if (postEntry && !liked) {
      toast({
        title: "You can like this post after reading it",
      });

      router.push(`/posts/${post.slug}`);
      return;
    } else if (postEntry && liked) {
      setOpenDialog(true);
      return;
    }

    const newLiked = !liked;
    const newLikes = newLiked ? likes + 1 : likes - 1;

    setLiked(newLiked);
    setLikes(newLikes);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        let newLikeCount;

        if (!newLiked) {
          newLikeCount = (await PostsAPI.unlike(post._id, "post")).totalLikes;
        } else {
          newLikeCount = (await PostsAPI.like(post._id, "post")).totalLikes;
        }

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
      } catch {
        setLiked(!newLiked);
        setLikes(newLiked ? likes - 1 : likes + 1);
      }
    }, 300);
  }, [
    liked,
    post._id,
    user,
    setPostsLikeCount,
    showSignIn,
    likes,
    postEntry,
    toast,
    router,
    post.slug,
  ]);

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
    if (post.isLoggedInUserLiked) {
      setLiked(true);
    } else {
      setLiked(false);
    }
  }, [user, post.isLoggedInUserLiked]);

  useEffect(() => {
    postEntry &&
      setLikes(
        postsLikeCount.find((p) => p.postId === post._id)?.likeCount ||
          post.likeCount ||
          0
      );
  }, [postsLikeCount, post._id, post.likeCount, postEntry]);

  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <Button
        onClick={postEntry && liked ? () => setOpenDialog(true) : handleClick}
        variant={variant}
        className={`gap-2 px-3 py-2 ${className}`}>
        {liked ? <PiHeartFill size={22} color="red" /> : <PiHeart size={22} />}
        {likes === 0 && "Like"}
        {likes > 0 && likes < 2 && `${likes} Like`}
        {likes >= 2 && `${likes} Likes`}
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
