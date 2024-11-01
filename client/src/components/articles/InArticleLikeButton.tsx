"use client";

import { useCallback, useState, useRef, useEffect, use } from "react";
import { Button } from "../ui/button";
import { PiHeart, PiHeartFill } from "react-icons/pi";
import ArticlesAPI from "@/api/article";
import useAuth from "@/hooks/useAuth";
import useAuthDialogs from "@/hooks/useAuthDialogs";
import { Article } from "@/validation/schema/article";
import { useToast } from "../ui/use-toast";
import { SWRResponse } from "swr";
import useArticlesLoader from "@/hooks/useArticlesLoader";
import useNavigation from "@/hooks/useNavigation";

interface InArticleLikeButtonProps {
  article: Article;
  liked?: boolean;
  setLiked: (liked: boolean) => void;
  likes: number;
  setLikes: (likes: number) => void;
  isLoading: boolean;
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
  liked,
  setLiked,
  likes,
  setLikes,
  isLoading,
}: InArticleLikeButtonProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { user } = useAuth();
  const { showSignIn } = useAuthDialogs();
  const { toast } = useToast();

  const { cacheRef } = useArticlesLoader();
  const { prevUrl } = useNavigation();

  const handleClick = useCallback(async () => {
    if (!user) {
      showSignIn();
      return;
    }

    if (isLoading) return;
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

        if (prevUrl) {
          const articleIndex = cacheRef.current[prevUrl].findIndex(
            (a) => a._id === article._id
          );

          if (articleIndex !== -1) {
            cacheRef.current[prevUrl][articleIndex].likeCount = newLikes;
            cacheRef.current[prevUrl][articleIndex].isLoggedInUserLiked =
              newLiked;
          }
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
  }, [
    user,
    liked,
    likes,
    article,
    showSignIn,
    toast,
    setLiked,
    isLoading,
    setLikes,
    prevUrl,
    cacheRef,
  ]);

  return (
    <Button
      onClick={handleClick}
      variant={variant}
      className={`gap-1 px-3 py-2 ${className}`}>
      {liked ? <PiHeartFill size={22} color="red" /> : <PiHeart size={22} />}

      <span>{likes > 0 && likes}</span>
      <span>{likes <= 1 ? "Like" : "Likes"}</span>
    </Button>
  );
}
