import {} from "@radix-ui/react-avatar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { FaUser } from "react-icons/fa";

interface UserAvatarProps {
  username?: string;
  profilePicUrl?: string;
}

export default function UserAvatar({
  username,
  profilePicUrl = "",
}: UserAvatarProps) {
  return (
    <Avatar>
      <AvatarImage src={profilePicUrl} alt={`${username || "user"} avatar`} />
      <AvatarFallback className="bg-neutral-200">
        <FaUser size={26} className=" text-neutral-500 dark:text-neutral-300" />
      </AvatarFallback>
    </Avatar>
  );
}
