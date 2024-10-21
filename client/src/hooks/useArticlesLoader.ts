import { ArticlesContext } from "@/context/ArticlesContext";
import { useContext } from "react";

export default function useArticlesLoader() {
  const context = useContext(ArticlesContext);

  if (!context) {
    throw new Error(
      "useArticlesLoader must be used within a ArticlesContextProvider"
    );
  }

  return context;
}
