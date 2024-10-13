"use client";

import UserAPI from "@/api/user";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { useCallback, useRef, useState } from "react";

interface FollowButtonProps {
  userId: string;
  isLoggedInUserFollowing?: boolean;
  totalFollowers: number;
  setTotalFollowers: React.Dispatch<React.SetStateAction<number>>;
  className?: string;
  variant?:
    | "outline"
    | "link"
    | "default"
    | "destructive"
    | "secondary"
    | "ghost"
    | null
    | undefined;
}

export default function FollowButton({
  userId,
  isLoggedInUserFollowing,
  totalFollowers,
  setTotalFollowers,
  className,
  variant,
}: FollowButtonProps) {
  const { toast } = useToast();

  const [isFollowing, setIsFollowing] = useState(isLoggedInUserFollowing);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleClick = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const newFollowingStatus = !isFollowing;
    const newTotalFollowers = newFollowingStatus
      ? totalFollowers + 1
      : totalFollowers - 1;

    setIsFollowing(newFollowingStatus);
    setTotalFollowers(newTotalFollowers);

    timeoutRef.current = setTimeout(async () => {
      try {
        if (!newFollowingStatus) {
          await UserAPI.unFollowUser(userId);
        } else {
          await UserAPI.followUser(userId);
        }
      } catch {
        toast({
          title: "An error occurred",
          description: "Please try again later.",
        });
        setIsFollowing(!newFollowingStatus);
        setTotalFollowers(totalFollowers);
      }
    }, 250);
  }, [isFollowing, setTotalFollowers, totalFollowers, userId, toast]);

  return (
    <Button onClick={handleClick} className={className} variant={variant}>
      {isFollowing ? "Followed" : "Follow"}
    </Button>
  );
}
