"use client";

import { Article } from "@/validation/schema/article";
import { Button } from "../ui/button";
import { BiShareAlt } from "react-icons/bi";
import { useToast } from "../ui/use-toast";
import InArticleLikeButton from "./InArticleLikeButton";

interface InArticleLikeProps {
  article: Article;
  liked?: boolean;
  setLiked: (liked: boolean) => void;
  likes: number;
  setLikes: (likes: number) => void;
  isLoading: boolean;
}

export default function InArticleLike(props: InArticleLikeProps) {
  const { toast } = useToast();

  function handleCopyLink() {
    navigator.clipboard.writeText(
      `${window.location.origin}/articles/${props.article.slug}`
    );
    toast({
      title: "Article link copied to clipboard",
    });
  }

  return (
    <div className="flex gap-2 items-center justify-center  max-w-prose mx-auto outline outline-1 dark:outline-0 outline-neutral-200 dark:bg-neutral-950 rounded-md p-4 mt-5">
      {/* The id here is because when click the comment button on article entry, it will take to a perfect position to show comments */}
      <span id="comment-section" className="hidden sm:block">
        Do you like this article?
      </span>

      <InArticleLikeButton variant="outline" className="ml-3" {...props} />
      <Button onClick={handleCopyLink} variant="outline" className="gap-2 ml-1">
        <BiShareAlt size={22} className="-ml-1" />
        Share
      </Button>
    </div>
  );
}
