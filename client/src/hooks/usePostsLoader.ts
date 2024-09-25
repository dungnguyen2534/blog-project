import { PostsContext } from "@/context/PostsContext";
import { useContext } from "react";

export default function usePostsLoader() {
  const context = useContext(PostsContext);

  if (!context) {
    throw new Error(
      "usePostsLoader must be used within a PostsContextProvider"
    );
  }

  return context;
}
