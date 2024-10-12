"use client";

import UserAPI from "@/api/user";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { useState } from "react";

interface FollowButtonProps {
  userId: string;
  isLoggedInUserFollowing?: boolean;
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
  setTotalFollowers,
  className,
  variant,
}: FollowButtonProps) {
  const { toast } = useToast();

  const [isFollowing, setIsFollowing] = useState(
    isLoggedInUserFollowing ?? false
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  async function handleClick() {
    setIsSubmitting(true);

    try {
      let totalFollowers;
      let followingStatus;

      if (isFollowing) {
        ({ totalFollowers } = await UserAPI.unFollowUser(userId));
        followingStatus = false;
      } else {
        ({ totalFollowers } = await UserAPI.followUser(userId));
        followingStatus = true;
      }

      setTotalFollowers(totalFollowers);
      setIsFollowing(followingStatus);
    } catch {
      toast({
        title: "An error occurred",
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={isSubmitting}
      className={className}
      variant={variant}>
      {isFollowing ? "Followed" : "Follow"}
    </Button>
  );
}
