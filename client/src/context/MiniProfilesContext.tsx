"use client";

import { User } from "@/validation/schema/user";
import { createContext, useState } from "react";

interface FollowContextProps {
  usersToFollow: {
    userId: string;
    followed: boolean;
    totalFollowers: number;
  }[];
  setUsersToFollow: React.Dispatch<
    React.SetStateAction<
      { userId: string; followed: boolean; totalFollowers: number }[]
    >
  >;
}

export const MiniProfilesContext = createContext<
  FollowContextProps | undefined
>(undefined);

interface FollowProvideProps {
  children: React.ReactNode;
}

export default function MiniProfilesContextProvider({
  children,
}: FollowProvideProps) {
  const [usersToFollow, setUsersToFollow] = useState(
    [] as { userId: string; followed: boolean; totalFollowers: number }[]
  );

  return (
    <MiniProfilesContext.Provider value={{ usersToFollow, setUsersToFollow }}>
      {children}
    </MiniProfilesContext.Provider>
  );
}
