"use client";

import React, { useCallback, useRef, useState } from "react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import TagsAPI from "@/api/tag";
import useAuthDialogs from "@/hooks/useAuthDialogs";
import useAuth from "@/hooks/useAuth";
import { usePathname } from "next/navigation";
import { revalidatePathData } from "@/lib/revalidate";

interface FollowTagButtonProps {
  tagName: string;
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

export default function FollowTagButton({
  tagName,
  isLoggedInUserFollowing,
  totalFollowers,
  setTotalFollowers,
  className,
  variant,
}: FollowTagButtonProps) {
  const { toast } = useToast();

  const { user } = useAuth();
  const { showSignIn } = useAuthDialogs();
  const pathname = usePathname();

  const [isFollowing, setIsFollowing] = useState(isLoggedInUserFollowing);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleClick = useCallback(async () => {
    if (!user) {
      showSignIn();
      return;
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const newFollowingStatus = !isFollowing;
    const newTotalFollowers = newFollowingStatus
      ? totalFollowers + 1
      : Math.max(totalFollowers - 1, 0);

    setIsFollowing(newFollowingStatus);
    setTotalFollowers(newTotalFollowers);

    timeoutRef.current = setTimeout(async () => {
      try {
        if (!newFollowingStatus) {
          await TagsAPI.unFollowTag(tagName);
        } else {
          await TagsAPI.followTag(tagName);
        }

        revalidatePathData(pathname);
      } catch {
        toast({
          title: "An error occurred",
          description: "Please try again later.",
        });
        setIsFollowing(!newFollowingStatus);
        setTotalFollowers(totalFollowers);
      }
    }, 300);
  }, [
    isFollowing,
    setTotalFollowers,
    totalFollowers,
    toast,
    tagName,
    showSignIn,
    user,
    pathname,
  ]);

  return (
    <Button onClick={handleClick} className={className} variant={variant}>
      {isFollowing ? "Followed" : "Follow"}
    </Button>
  );
}
