"use client";

import { useCallback, useState } from "react";
import { Button } from "../ui/button";
import { PiHeart, PiHeartFill } from "react-icons/pi";
import ArticlesAPI from "@/api/article";
import { useToast } from "../ui/use-toast";
import { Article } from "@/validation/schema/article";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import Link from "next/link";

interface ArticleEntryLikeButtonProps {
  article: Article;
  className?: string;
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | null
    | undefined;
}

export default function ArticleEntryLikeButton({
  article,
  className,
  variant,
}: ArticleEntryLikeButtonProps) {
  const [liked, setLiked] = useState(article.isLoggedInUserLiked);
  const [likes, setLikes] = useState(article.likeCount);

  const [openDialog, setOpenDialog] = useState(false);
  const { toast } = useToast();

  function handleClick() {
    if (!liked) {
      toast({
        title: "You can like the article after reading it",
      });
    }
  }

  const unlikeArticle = useCallback(async () => {
    try {
      const newLikeCount = (await ArticlesAPI.unlike(article._id, "article"))
        .totalLikes;

      setLiked(false);
      setLikes((prevLikes) => prevLikes - 1);
      setOpenDialog(false);
    } catch {
      toast({
        title: "An error occurred, please try again later",
      });
    }
  }, [article._id, toast]);

  const buttonContent = (
    <>
      {liked ? (
        <PiHeartFill size={23} color="red" className="mb-[0.1rem]" />
      ) : (
        <PiHeart size={23} className="mb-[0.1rem]" />
      )}
      {likes > 0 && <span>{likes}</span>}
      <span className="hidden sm:block">{likes <= 1 ? "Like" : "Likes"}</span>
    </>
  );

  // conditionally using a link for the button to show the progress bar(only show when using next/link)
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      {likes > 0 ? (
        <Button
          asChild={!liked}
          onClick={liked ? () => setOpenDialog(true) : handleClick}
          variant={variant}
          className={`gap-1 px-3 py-2 ${className}`}>
          {!liked ? (
            <Link href={`/articles/${article.slug}`}>{buttonContent}</Link>
          ) : (
            buttonContent
          )}
        </Button>
      ) : (
        <Button
          asChild={!liked}
          onClick={liked ? () => setOpenDialog(true) : handleClick}
          variant={variant}
          className={`gap-1 px-3 py-2 sm:hidden ${className}`}>
          {!liked ? (
            <Link href={`/articles/${article.slug}`}>{buttonContent}</Link>
          ) : (
            buttonContent
          )}
        </Button>
      )}

      <DialogContent aria-describedby="">
        <DialogHeader>
          <DialogTitle>Unlike this article?</DialogTitle>
          <DialogDescription />
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <Button onClick={() => setOpenDialog(false)}>Turn back</Button>
          <Button
            onClick={unlikeArticle}
            className="bg-red-600 hover:!bg-red-700 text-white">
            Unlike it
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
