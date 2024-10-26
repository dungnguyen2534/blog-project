"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { PiHeart, PiHeartFill } from "react-icons/pi";
import useAuthDialogs from "@/hooks/useAuthDialogs";
import useAuth from "@/hooks/useAuth";
import ArticlesAPI from "@/api/article";
import useCommentsLoader from "@/hooks/useCommentsLoader";

interface LikeCommentButtonProps {
  likeCount: number;
  commentId: string;
  isLoggedInUserLiked?: boolean;
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

export default function LikeCommentButton({
  commentId,
  likeCount,
  isLoggedInUserLiked,
  variant,
  className,
}: LikeCommentButtonProps) {
  const [likes, setLikes] = useState(likeCount);
  const [liked, setLiked] = useState(isLoggedInUserLiked);

  useEffect(() => {
    setLikes(likeCount);
    setLiked(isLoggedInUserLiked);
  }, [likeCount, isLoggedInUserLiked]);

  const { isClientSideLoading } = useCommentsLoader();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { user } = useAuth();
  const { showSignIn } = useAuthDialogs();

  const handleClick = useCallback(async () => {
    if (!user) {
      showSignIn();
      return;
    }

    if (isClientSideLoading) return;

    if (!user.username) return;

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
          newLikeCount = (await ArticlesAPI.unlike(commentId, "comment"))
            .totalLikes;
        } else {
          newLikeCount = (await ArticlesAPI.like(commentId, "comment"))
            .totalLikes;
        }
      } catch {
        setLiked(!newLiked);
        setLikes(newLiked ? likes - 1 : likes + 1);
      }
    }, 300);
  }, [liked, commentId, user, showSignIn, likes, isClientSideLoading]);

  return (
    <Button onClick={handleClick} variant={variant} className={className}>
      {liked ? <PiHeartFill size={22} color="red" /> : <PiHeart size={22} />}
      {likes === 0 && "Like"}
      {likes > 0 && likes < 2 && `${likes} Like`}
      {likes >= 2 && `${likes} Likes`}
    </Button>
  );
}
