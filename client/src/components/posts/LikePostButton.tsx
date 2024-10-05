"use client";

import { useCallback, useState, useRef, useEffect, use } from "react";
import { Button } from "../ui/button";
import { PiHeart, PiHeartFill } from "react-icons/pi";
import PostsAPI from "@/api/post";
import useAuth from "@/hooks/useAuth";
import usePostsLoader from "@/hooks/usePostsLoader";
import useAuthDialogs from "@/hooks/useAuthDialogs";

interface LikePostButtonProps {
  initialLikeCount: number;
  postId: string;
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

export default function LikePostButton({
  initialLikeCount,
  postId,
  isLoggedInUserLiked,
  loggedInUserLikedId,
  className,
  variant,
}: LikePostButtonProps) {
  const { postsLikeCount, setPostsLikeCount } = usePostsLoader();
  const [likes, setLikes] = useState(
    postsLikeCount.find((post) => post.postId === postId)?.likeCount ||
      initialLikeCount
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
          await PostsAPI.unlike(postId, "post");
        } else {
          await PostsAPI.like(postId, "post");
        }

        setPostsLikeCount((prevCounts) =>
          prevCounts.map((post) =>
            post.postId === postId
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
  }, [liked, postId, user, setPostsLikeCount, showSignIn]);

  useEffect(() => {
    if (user && user._id === loggedInUserLikedId) {
      setLiked(true);
    } else {
      setLiked(false);
    }
  }, [user, loggedInUserLikedId]);

  useEffect(() => {
    const postLikeCount = postsLikeCount.find(
      (post) => post.postId === postId
    )?.likeCount;
    if (postLikeCount !== undefined) {
      setLikes(postLikeCount);
    }
  }, [postsLikeCount, postId]);

  return (
    <Button onClick={handleClick} variant={variant} className={className}>
      {liked ? <PiHeartFill size={22} color="red" /> : <PiHeart size={22} />}
      {likes === 0 && "Like"}
      {likes > 0 && likes < 2 && `${likes} Like`}
      {likes >= 2 && `${likes} Likes`}
    </Button>
  );
}
