"use client";

import { useCallback, useState, useRef, useEffect, use } from "react";
import { Button } from "./ui/button";
import { PiHeart, PiHeartFill } from "react-icons/pi";
import PostsAPI from "@/api/post";
import useAuth from "@/hooks/useAuth";
import usePostsLoader from "@/hooks/usePostsLoader";

interface LikeButtonProps {
  initialLikeCount: number;
  targetId: string;
  targetType: "post" | "comment";
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
  forComment?: boolean;
}

export default function LikeButton({
  initialLikeCount,
  targetId,
  targetType,
  isLoggedInUserLiked,
  loggedInUserLikedId,
  className,
  variant,
  forComment, // TODO: implement comment like
}: LikeButtonProps) {
  const { postsLikeCount, setPostsLikeCount } = usePostsLoader();
  const [likes, setLikes] = useState(
    postsLikeCount.find((post) => post.postId === targetId)?.likeCount ||
      initialLikeCount
  );

  const [liked, setLiked] = useState(isLoggedInUserLiked);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { user } = useAuth();

  const handleClick = useCallback(async () => {
    if (!user) return;

    setLiked(!liked);
    setLikes((prevLikes) => (liked ? prevLikes - 1 : prevLikes + 1));

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      try {
        if (liked) {
          await PostsAPI.unlike(targetId, targetType);
        } else {
          await PostsAPI.like(targetId, targetType);
        }

        setPostsLikeCount((prevCounts) =>
          prevCounts.map((post) =>
            post.postId === targetId
              ? {
                  ...post,
                  likeCount: liked ? post.likeCount - 1 : post.likeCount + 1,
                }
              : post
          )
        );
      } catch {
        setLiked(!liked);
      }
    }, 300);
  }, [liked, targetId, targetType, user, setPostsLikeCount]);

  useEffect(() => {
    if (user && user._id === loggedInUserLikedId) {
      setLiked(true);
    } else {
      setLiked(false);
    }
  }, [user, loggedInUserLikedId]);

  useEffect(() => {
    const postLikeCount = postsLikeCount.find(
      (post) => post.postId === targetId
    )?.likeCount;
    if (postLikeCount !== undefined) {
      setLikes(postLikeCount);
    }
  }, [postsLikeCount, targetId]);

  return (
    <Button onClick={handleClick} variant={variant} className={className}>
      {liked ? <PiHeartFill size={22} color="red" /> : <PiHeart size={22} />}
      {likes === 0 && `Like`}
      {likes > 0 && likes < 2 && `${likes} Like`}
      {likes >= 2 && `${likes} Likes`}
    </Button>
  );
}
