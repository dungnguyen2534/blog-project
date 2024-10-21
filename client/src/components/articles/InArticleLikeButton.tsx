"use client";

import { useCallback, useState, useRef, useEffect, use } from "react";
import { Button } from "../ui/button";
import { PiHeart, PiHeartFill } from "react-icons/pi";
import ArticlesAPI from "@/api/article";
import useAuth from "@/hooks/useAuth";
import useAuthDialogs from "@/hooks/useAuthDialogs";
import { Article } from "@/validation/schema/article";
import { useToast } from "../ui/use-toast";

interface InArticleLikeButtonProps {
  article: Article;
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
  articleEntry?: boolean;
}

export default function InArticleLikeButton({
  article,
  className,
  variant,
}: InArticleLikeButtonProps) {
  const [liked, setLiked] = useState(article.isLoggedInUserLiked);
  const [likes, setLikes] = useState(article.likeCount);

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
          await ArticlesAPI.unlike(article._id, "article");
        } else {
          await ArticlesAPI.like(article._id, "article");
        }
      } catch {
        toast({
          title: "An error occurred",
          description: "Please try again later.",
        });
        setLiked(!newLiked);
        setLikes(newLiked ? likes - 1 : likes + 1);
      }
    }, 300);
  }, [liked, likes, article._id, showSignIn, user, toast]);

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      className={`gap-1 px-3 py-2 ${className}`}>
      {liked ? <PiHeartFill size={22} color="red" /> : <PiHeart size={22} />}
      {likes > 0 && <span>{likes}</span>}
      {likes <= 1 ? <span>Like</span> : <span>Likes</span>}
    </Button>
  );
}
