"use client";

import FollowTagButton from "@/components/FollowTagButton";
import { useState } from "react";
import { BsPeople } from "react-icons/bs";
import { HiOutlineNewspaper } from "react-icons/hi2";

interface TagPageProps {
  tagName: string;
  followerCount: number;
  articleCount: number;
  isLoggedInUserFollowing?: boolean;
}

export default function TagInfo({
  tagName,
  followerCount,
  isLoggedInUserFollowing,
  articleCount,
}: TagPageProps) {
  const [totalFollowers, setTotalFollowers] = useState(followerCount);

  return (
    <div className="secondary-container rounded-none md:rounded-md  flex p-5 mb-1 md:mb-2 items-center justify-between main-outline">
      <div>
        <h1 className="font-bold text-2xl sm:text-3xl mb-2">{"#" + tagName}</h1>
        <div className="flex gap-3 items-center">
          <div className="text-muted-foreground text-sm flex gap-1 items-center md:justify-center">
            <HiOutlineNewspaper size={23} className="mb-[0.1rem]" />
            {articleCount} {articleCount === 1 ? "Article" : "Articles"}
          </div>
          <div className="text-muted-foreground text-sm flex gap-1 items-center md:justify-center">
            <BsPeople size={20} className="mb-[0.1rem]" />
            {totalFollowers} {totalFollowers === 1 ? "Follower" : "Followers"}
          </div>
        </div>
      </div>

      <div>
        <FollowTagButton
          tagName={tagName}
          totalFollowers={totalFollowers}
          setTotalFollowers={setTotalFollowers}
          isLoggedInUserFollowing={isLoggedInUserFollowing}
          className="w-24"
          variant="outline"
        />
      </div>
    </div>
  );
}
