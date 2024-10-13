"use client";

import { useCallback, useState, useRef, useEffect, use } from "react";
import { Button } from "../ui/button";
import { PiHeart, PiHeartFill } from "react-icons/pi";
import PostsAPI from "@/api/post";
import useAuth from "@/hooks/useAuth";
import useAuthDialogs from "@/hooks/useAuthDialogs";
import { Post } from "@/validation/schema/post";
import { useToast } from "../ui/use-toast";

interface InPostLikeButtonProps {
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

export default function InPostLikeButton({
  post,
  className,
  variant,
}: InPostLikeButtonProps) {
  const [liked, setLiked] = useState(post.isLoggedInUserLiked);
  const [likes, setLikes] = useState(post.likeCount);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { user } = useAuth();
  const { showSignIn } = useAuthDialogs();
  const { toast } = useToast();

  const handleClick = useCallback(async () => {
    if (!user) {
      showSignIn();
      return;
    }

    if (!user.username) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const newLiked = !liked;
    const newLikes = newLiked ? likes + 1 : likes - 1;

    setLiked(newLiked);
    setLikes(newLikes);

    timeoutRef.current = setTimeout(async () => {
      try {
        if (!newLiked) {
          await PostsAPI.unlike(post._id, "post");
        } else {
          await PostsAPI.like(post._id, "post");
        }
      } catch {
        toast({
          title: "An error occurred",
          description: "Please try again later.",
        });
        setLiked(!newLiked);
        setLikes(newLiked ? likes - 1 : likes + 1);
      }
    }, 250);
  }, [liked, likes, post._id, showSignIn, user, toast]);

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      className={`gap-2 px-3 py-2 ${className}`}>
      {liked ? <PiHeartFill size={22} color="red" /> : <PiHeart size={22} />}
      {likes === 0 && "Like"}
      {likes > 0 && likes < 2 && `${likes} Like`}
      {likes >= 2 && `${likes} Likes`}
    </Button>
  );
}
