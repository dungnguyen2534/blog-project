import React, { useEffect, useRef, useState } from "react";
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
import { usePathname } from "next/navigation";
import useMobileDeviceDetecter from "@/hooks/useMobileDeviceDetecter";

interface MiniProfileProps {
  children: React.ReactNode;
  author: User;
  customTrigger?: boolean;
}

export default function MiniProfile({
  children,
  author,
  customTrigger,
}: MiniProfileProps) {
  const { user: LoggedInUser } = useAuth();
  const [noTooltip, setNoTooltip] = useState(false);
  const pathname = usePathname();
  const isMobile = useMobileDeviceDetecter();

  const [totalFollowers, setTotalFollowers] = useState(author.totalFollowers);

  useEffect(() => {
    if (isMobile) {
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
                    className="w-full"
                    userId={author._id}
                    isLoggedInUserFollowing={author.isLoggedInUserFollowing}
                    totalFollowers={totalFollowers}
                    setTotalFollowers={setTotalFollowers}
                    variant="secondary"
                  />
                ) : (
                  <Button asChild variant="secondary">
                    <Link href={`/users/${author.username}`}>Your Profile</Link>
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
