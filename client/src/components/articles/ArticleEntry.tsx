"use client";

import React, { forwardRef, Ref, useCallback, useRef, useState } from "react";
import Link from "next/link";
import ArticleOptions from "./ArticleOptions";
import { Article } from "@/validation/schema/article";
import { IoChatboxOutline } from "react-icons/io5";
import { Button } from "../ui/button";
import ArticleTags from "./ArticleTags";
import ArticleEntryLikeButton from "./ArticleEntryLikeButton";
import { calculateReadingTime } from "@/lib/utils";
import { MdBookmarkAdded, MdOutlineBookmarkAdd } from "react-icons/md";
import useAuth from "@/hooks/useAuth";
import ArticlesAPI from "@/api/article";
import { useToast } from "../ui/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

interface ArticleEntryProps {
  article: Article;
}

const ArticleEntry = forwardRef<HTMLElement, ArticleEntryProps>(
  ({ article }, ref) => {
    const [isSaved, setIsSaved] = useState(article.isSavedArticle);

    const { user } = useAuth();
    const { toast } = useToast();

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const bookmark = useCallback(async () => {
      if (!user) {
        toast({
          title: "Please sign in to bookmark this article",
        });
        return;
      }

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const newIsSaved = !isSaved;
      setIsSaved(newIsSaved);

      timeoutRef.current = setTimeout(async () => {
        try {
          if (isSaved) {
            await ArticlesAPI.unsaveArticle(article._id);
          } else {
            await ArticlesAPI.saveArticle(article._id);
          }
          toast({
            title: isSaved
              ? "Article removed from bookmarks"
              : "Article bookmarked",
          });
        } catch {
          setIsSaved(!newIsSaved);
          toast({
            title: "An error occurred",
            description: "Please try again later",
          });
        }
      }, 300);
    }, [isSaved, article._id, toast, user]);

    return (
      <article
        ref={ref}
        className="secondary-container px-4 pt-3 !pb-1 sm:!pb-2 md:p-4 w-full flex flex-col gap-2 rounded-none md:rounded-md ring-1 ring-[#f4f4f4] dark:ring-neutral-900 overflow-hidden break-words">
        <ArticleOptions
          article={article}
          author={article.author}
          menuOnTop
          articleEntry
        />

        <div className="md:ml-[2.85rem]">
          <Link
            href={`/articles/${article.slug}`}
            className="flex flex-col gap-2">
            <h2 className="text-lg sm:text-2xl font-bold">{article.title}</h2>
            {article.summary && (
              <p className="line-clamp-2 break-words text-sm text-neutral-600 dark:text-neutral-400">
                {article.summary}
              </p>
            )}
          </Link>
          <ArticleTags tags={article.tags} />
          <div className="mt-2 sm:mt-1 flex items-center justify-between font-light text-sm">
            <div className="flex items-center gap-3">
              <ArticleEntryLikeButton
                article={article}
                className="-ml-3"
                variant="ghost"
              />
              <Button asChild variant="ghost" className="gap-1 px-3 py-2 -ml-3">
                <Link href={`/articles/${article.slug}#comment-section`}>
                  <IoChatboxOutline size={22} className="mt-[0.14rem]" />
                  <span>
                    {article.commentCount > 0 && article.commentCount}
                  </span>
                  <span className={`hidden sm:block `}>
                    {article.commentCount <= 1 ? "Comment" : "Comments"}
                  </span>
                </Link>
              </Button>
            </div>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="text-muted-foreground cursor-pointer hover:text-black dark:hover:text-white items-center gap-1 -mr-1 px-3"
                    onClick={bookmark}>
                    <span className="font-medium text-xs">
                      {calculateReadingTime(article.body)} min read
                    </span>
                    {isSaved ? (
                      <MdBookmarkAdded size={19} />
                    ) : (
                      <MdOutlineBookmarkAdd size={19} />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bookmark</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </article>
    );
  }
);

ArticleEntry.displayName = "ArticleEntry";

export default ArticleEntry;
