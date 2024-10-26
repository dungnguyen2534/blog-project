import {} from "@radix-ui/react-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FaUser } from "react-icons/fa";
import Image from "next/image";

interface UserAvatarProps {
  username?: string;
  profilePicUrl?: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export default function UserAvatar({
  username,
  className,
  profilePicUrl,
  width,
  height,
  priority,
}: UserAvatarProps) {
  return (
    <Avatar className={`w-[2.4rem] h-[2.4rem] ${className} `}>
      <AvatarImage src={profilePicUrl} asChild>
        <Image
          src={profilePicUrl || ""}
          alt={`${username || "user"} avatar`}
          width={width || 80}
          height={height || 80}
          priority={priority}
        />
      </AvatarImage>
      <AvatarFallback className="overflow-hidden">
        <FaUser
          size="50%"
          className=" text-neutral-500 dark:text-neutral-300"
        />
      </AvatarFallback>
    </Avatar>
  );
}
