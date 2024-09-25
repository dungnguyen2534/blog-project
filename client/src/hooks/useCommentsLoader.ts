import { CommentsContext } from "@/context/CommentsContext";
import { useContext } from "react";

export default function useCommentsLoader() {
  const context = useContext(CommentsContext);

  if (!context) {
    throw new Error(
      "useCommentsLoader must be used within a CommentsContextProvider"
    );
  }

  return context;
}
