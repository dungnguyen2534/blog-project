"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { PiHeart, PiHeartFill } from "react-icons/pi";
import useCommentsLoader from "@/hooks/useCommentsLoader";
import useAuthDialogs from "@/hooks/useAuthDialogs";
import useAuth from "@/hooks/useAuth";
import PostsAPI from "@/api/post";

interface LikeCommentButtonProps {
  initialLikeCount?: number;
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
  initialLikeCount,
  isLoggedInUserLiked,
  variant,
  className,
}: LikeCommentButtonProps) {
  const { commentsLikeCount, setCommentsLikeCount } = useCommentsLoader();
  const [likes, setLikes] = useState(
    commentsLikeCount.find((comment) => comment.commentId === commentId)
      ?.likeCount ||
      initialLikeCount ||
      0
  );

  const [liked, setLiked] = useState(isLoggedInUserLiked);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { user } = useAuth();
  const { showSignIn } = useAuthDialogs();

  const handleClick = useCallback(async () => {
    if (!user) {
      showSignIn();
      return;
    }

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
          newLikeCount = (await PostsAPI.unlike(commentId, "comment"))
            .totalLikes;
        } else {
          newLikeCount = (await PostsAPI.like(commentId, "comment")).totalLikes;
        }

        setCommentsLikeCount((prevCounts) =>
          prevCounts.map((comment) =>
            comment.commentId === commentId
              ? {
                  ...comment,
                  likeCount: newLikeCount,
                }
              : comment
          )
        );
      } catch {
        setLiked(!newLiked);
        setLikes(newLiked ? likes - 1 : likes + 1);
      }
    }, 300);
  }, [liked, commentId, user, setCommentsLikeCount, showSignIn, likes]);

  return (
    <Button onClick={handleClick} variant={variant} className={className}>
      {liked ? <PiHeartFill size={22} color="red" /> : <PiHeart size={22} />}
      {likes === 0 && "Like"}
      {likes > 0 && likes < 2 && `${likes} Like`}
      {likes >= 2 && `${likes} Likes`}
    </Button>
  );
}
