import {} from "@radix-ui/react-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import { FaUser } from "react-icons/fa";
import env from "@/validation/env-validation";

interface UserAvatarProps {
  username?: string;
  profilePicUrl?: string;
  className?: string;
}

export default function UserAvatar({
  username,
  className,
  profilePicUrl,
}: UserAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src={profilePicUrl} alt={`${username || "user"} avatar`} />
      <AvatarFallback className="overflow-hidden">
        <FaUser
          size="50%"
          className=" text-neutral-500 dark:text-neutral-300"
        />
      </AvatarFallback>
    </Avatar>
  );
}
