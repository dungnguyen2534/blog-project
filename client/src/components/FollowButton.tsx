"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import UserAPI from "@/api/user";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import useFollowUser from "@/hooks/useFollowUser";

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
  const { usersToFollow, setUsersToFollow } = useFollowUser();

  const { toast } = useToast();
  const [isFollowing, setIsFollowing] = useState(isLoggedInUserFollowing);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setIsFollowing(
      usersToFollow.find((user) => user.userId === userId)?.followed
    );

    setTotalFollowers(
      usersToFollow.find((u) => u.userId === userId)?.totalFollowers ??
        totalFollowers
    );
  }, [usersToFollow, userId, totalFollowers, setTotalFollowers]);

  const handleClick = useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const newFollowingStatus = !isFollowing;
    const newTotalFollowers = newFollowingStatus
      ? totalFollowers + 1
      : Math.max(totalFollowers - 1, 0);

    setUsersToFollow((prev) =>
      prev.map((user) => {
        if (user.userId === userId) {
          return {
            userId,
            followed: newFollowingStatus,
            totalFollowers: newTotalFollowers,
          };
        }
        return user;
      })
    );

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

        setUsersToFollow((prev) => {
          return prev.map((user) => {
            if (user.userId === userId) {
              return {
                userId,
                followed: !newFollowingStatus,
                totalFollowers: totalFollowers,
              };
            }
            return user;
          });
        });
      }
    }, 250);
  }, [
    isFollowing,
    setTotalFollowers,
    totalFollowers,
    userId,
    toast,
    setUsersToFollow,
  ]);

  return (
    <Button onClick={handleClick} className={className} variant={variant}>
      {isFollowing ? "Followed" : "Follow"}
    </Button>
  );
}
