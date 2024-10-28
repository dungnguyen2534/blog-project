"use client";

import useAuth from "@/hooks/useAuth";
import { Article } from "@/validation/schema/article";
import { User } from "@/validation/schema/user";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { BsThreeDots } from "react-icons/bs";
import { FaRegEdit } from "react-icons/fa";
import {
  MdBookmarkAdded,
  MdOutlineBookmarkAdd,
  MdOutlineDeleteForever,
} from "react-icons/md";
import ArticlesAPI from "@/api/article";
import { useToast } from "../ui/use-toast";
import { UnauthorizedError } from "@/lib/http-errors";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DialogHeader } from "../ui/dialog";
import { Button } from "../ui/button";
import { useCallback, useEffect, useRef, useState } from "react";
import LoadingButton from "../LoadingButton";
import { useRouter } from "next/navigation";
import { revalidatePathData } from "@/lib/revalidate";
import { BiShareAlt } from "react-icons/bi";
import ArticleAuthor from "./ArticleAuthor";
import useNavigation from "@/hooks/useNavigation";
import useArticlesLoader from "@/hooks/useArticlesLoader";
import { SWRResponse } from "swr";

interface ArticleOptionsProps {
  article: Article;
  author: User;
  menuOnTop?: boolean;
  articleEntry?: boolean;
  isSaved?: boolean;
  setIsSaved?: (isSaved: boolean) => void;
  isLoading?: boolean;
}

export default function ArticleOptions({
  article,
  author,
  menuOnTop,
  articleEntry,
  isSaved,
  setIsSaved,
  isLoading,
}: ArticleOptionsProps) {
  const { user: LoggedInUser } = useAuth();
  const isAuthor = LoggedInUser?._id === author._id;

  const { setArticleList, cacheRef } = useArticlesLoader();

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const { toast } = useToast();

  function handleCopyLink() {
    navigator.clipboard.writeText(
      `${window.location.origin}/articles/${article.slug}`
    );
    toast({
      title: "Article link copied to clipboard",
    });
  }

  const router = useRouter();
  const { pathname, prevUrl } = useNavigation();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const bookmark = useCallback(async () => {
    if (!LoggedInUser) {
      toast({
        title: "Please sign in to bookmark this article",
      });
      return;
    }

    if (isLoading) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    const newIsSaved = !isSaved;
    setIsSaved && setIsSaved(newIsSaved);

    timeoutRef.current = setTimeout(async () => {
      try {
        if (isSaved) {
          await ArticlesAPI.unsaveArticle(article._id);
        } else {
          await ArticlesAPI.saveArticle(article._id);
        }

        if (prevUrl) {
          const articleIndex = cacheRef.current[prevUrl].findIndex(
            (a) => a._id === article._id
          );

          if (articleIndex !== -1) {
            cacheRef.current[prevUrl][articleIndex].isSavedArticle = newIsSaved;
          }
        }

        toast({
          title: isSaved
            ? "Article removed from bookmarks"
            : "Article bookmarked",
        });
      } catch {
        setIsSaved && setIsSaved(!newIsSaved);

        toast({
          title: "An error occurred",
          description: "Please try again later",
        });
      }
    }, 300);
  }, [
    isSaved,
    article._id,
    toast,
    LoggedInUser,
    setIsSaved,
    isLoading,
    prevUrl,
    ,
    cacheRef,
  ]);

  async function deleteArticle() {
    setIsDeleting(true);

    try {
      await ArticlesAPI.deleteArticle(article._id);
      revalidatePathData("/articles/" + article.slug);

      if (articleEntry) {
        setArticleList((prevList) => {
          const updatedList = prevList.filter((p) => p._id !== article._id);
          cacheRef.current[pathname] = updatedList;
          return updatedList;
        });
      }

      if (pathname === "/articles/" + article.slug) {
        prevUrl === "/articles/create-article"
          ? router.push("/")
          : router.push(prevUrl || "/");
      }
    } catch (error) {
      setShowDialog(false);
      setIsDeleting(false);
      if (error instanceof UnauthorizedError) {
        toast({
          title: "Unauthorized",
          description: "You are not authorized to delete this article",
        });
      } else {
        toast({
          title: "An error occurred",
          description: "Please try again later",
        });
      }
    } finally {
      articleEntry && setShowDialog(false);
    }
  }

  return (
    <div className="flex justify-between items-center">
      <ArticleAuthor article={article} articleEntry />
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DropdownMenu modal={false}>
          <div
            className={`text-neutral-500 dark:text-neutral-400 ${
              menuOnTop ? "-mt-5" : ""
            }`}>
            <DropdownMenuTrigger aria-label="Article options">
              <div className="rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-100 p-2">
                <BsThreeDots size={20} />
              </div>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent>
            {!articleEntry && (
              <DropdownMenuItem
                className="cursor-pointer flex items-center gap-2"
                onClick={bookmark}>
                {isSaved ? (
                  <MdBookmarkAdded size={24} className="-ml-[0.35rem]" />
                ) : (
                  <MdOutlineBookmarkAdd size={24} className="-ml-[0.35rem]" />
                )}
                Bookmark
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="cursor-pointer flex items-center gap-2"
              onClick={handleCopyLink}>
              <BiShareAlt size={22} className="-ml-1" />
              Copy link
            </DropdownMenuItem>
            {isAuthor && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="py-0">
                  <Link
                    href={`/articles/update-article/${article.slug}`}
                    className="flex items-center gap-2 w-full h-full py-2">
                    <FaRegEdit size={18} className="mb-[1px]" /> Update
                  </Link>
                </DropdownMenuItem>

                <DialogTrigger asChild>
                  <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                    <MdOutlineDeleteForever
                      size={22}
                      className="-ml-1 mb-[1px]"
                    />
                    Delete
                  </DropdownMenuItem>
                </DialogTrigger>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        <DialogContent
          className="[&>button]:hidden"
          onInteractOutside={(e) => isDeleting && e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Are you sure to delete this article?</DialogTitle>
            <DialogDescription>
              This action cannot be undone, your article will be permanently
              deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => setShowDialog(false)} disabled={isDeleting}>
              Turn back
            </Button>
            <LoadingButton
              loading={isDeleting}
              text="Sure, delete it"
              onClick={deleteArticle}
              className="bg-red-600 hover:!bg-red-700 text-white"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
