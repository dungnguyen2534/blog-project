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
  loggedInUserLikedId?: string;
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
  loggedInUserLikedId,
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

    setLiked((prevLiked) => !prevLiked);
    setLikes((prevLikes) => (liked ? prevLikes - 1 : prevLikes + 1));

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        if (liked) {
          await PostsAPI.unlike(commentId, "comment");
        } else {
          await PostsAPI.like(commentId, "comment");
        }

        setCommentsLikeCount((prevCounts) =>
          prevCounts.map((comment) =>
            comment.commentId === commentId
              ? {
                  ...comment,
                  likeCount: liked
                    ? comment.likeCount - 1
                    : comment.likeCount + 1,
                }
              : comment
          )
        );
      } catch {
        setLiked(!liked);
      }
    }, 300);
  }, [liked, commentId, user, setCommentsLikeCount, showSignIn]);

  return (
    <Button onClick={handleClick} variant={variant} className={className}>
      {liked ? <PiHeartFill size={22} color="red" /> : <PiHeart size={22} />}
      {likes === 0 && "Like"}
      {likes > 0 && likes < 2 && `${likes} Like`}
      {likes >= 2 && `${likes} Likes`}
    </Button>
  );
}
