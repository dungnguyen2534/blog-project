import { MiniProfilesContext } from "@/context/MiniProfilesContext";
import { useContext } from "react";

export default function useFollowUser() {
  const context = useContext(MiniProfilesContext);
  if (!context) {
    throw new Error("useFollowUser must be used within a FollowProvider");
  }
  return context;
}
