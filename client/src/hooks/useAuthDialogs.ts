import { AuthDialogsContext } from "@/components/auth/AuthDialogsProvider";
import { useContext } from "react";

export default function useAuthDialogs() {
  const authDialogsProvider = useContext(AuthDialogsContext);
  return authDialogsProvider;
}
