"use client";

import Link from "next/link";
import { formatDate } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import useAuth from "@/hooks/useAuth";
import { User } from "@/validation/schema/user";
import UserAvatar from "./UserAvatar";
import { Button } from "./ui/button";
import FollowButton from "./FollowButton";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import useMobileDeviceDetecter from "@/hooks/useMobileDeviceDetecter";
import revalidateCachedData from "@/lib/revalidate";

interface MiniProfileProviderProps {
  children: React.ReactNode;
  author: User;
  customTrigger?: boolean;
}

/**
 * Children as a trigger for the mini profile.
 * If customTrigger, need TooltipTrigger as parent for the trigger
 */
export default function MiniProfileProvider({
  children,
  author,
  customTrigger,
}: MiniProfileProviderProps) {
  const { user: LoggedInUser } = useAuth();
  const [totalFollowers, setTotalFollowers] = useState(author.totalFollowers);
  const [noTooltip, setNoTooltip] = useState(false);

  const pathname = usePathname();
  const isMobile = useMobileDeviceDetecter();

  useEffect(() => {
    if (pathname.includes(author.username) || isMobile) {
      setNoTooltip(true);
    }
  }, [pathname, setNoTooltip, author.username, isMobile]);

  return (
    <TooltipProvider>
      <Tooltip delayDuration={500}>
        {customTrigger ? (
          children
        ) : (
          <TooltipTrigger asChild>{children}</TooltipTrigger>
        )}
        {!noTooltip && (
          <TooltipContent>
            <div className="w-56 py-1">
              <Link
                onClick={() =>
                  revalidateCachedData("/users/" + author.username)
                }
                href={"/users/" + author.username}
                className="flex gap-2 items-center mb-2">
                <UserAvatar
                  username={author.username}
                  profilePicUrl={author.profilePicPath}
                  className="h-12 w-12"
                />
                <div className="flex flex-col">
                  <span className="text-base font-medium">
                    {author.username}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {totalFollowers}{" "}
                    {totalFollowers === 1 ? "follower" : "followers"}
                  </span>
                </div>
              </Link>
              <hr className="w-[95%] mx-auto" />
              <div className="flex flex-col gap-1 mt-2">
                {author._id !== LoggedInUser?._id ? (
                  <FollowButton
                    userId={author._id}
                    isLoggedInUserFollowing={author.isLoggedInUserFollowing}
                    totalFollowers={totalFollowers}
                    setTotalFollowers={setTotalFollowers}
                    variant="secondary"
                  />
                ) : (
                  <Button
                    onClick={() =>
                      revalidateCachedData("/users/" + author.username)
                    }
                    asChild
                    variant="secondary">
                    <Link href={`/users/${author.username}`}>Profile</Link>
                  </Button>
                )}

                <div className="mt-1 mb-[0.1rem]">{author.about}</div>
                <div className="flex flex-col">
                  <div className="font-semibold text-xs text-neutral-500 uppercase">
                    JOINED
                  </div>
                  <time suppressHydrationWarning dateTime={author.createdAt}>
                    {formatDate(author.createdAt, false)}
                  </time>
                </div>
              </div>
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
