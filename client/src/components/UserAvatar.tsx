import {} from "@radix-ui/react-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FaUser } from "react-icons/fa";

interface UserAvatarProps {
  username?: string;
  profilePicUrl?: string;
  className?: string;
  size?: number;
}

export default function UserAvatar({
  username,
  className,
  size = 26,
  profilePicUrl = "",
}: UserAvatarProps) {
  return (
    <Avatar className={className}>
      <AvatarImage src={profilePicUrl} alt={`${username || "user"} avatar`} />
      <AvatarFallback className="bg-neutral-200">
        <FaUser
          size={size}
          className=" text-neutral-500 dark:text-neutral-300"
        />
      </AvatarFallback>
    </Avatar>
  );
}
