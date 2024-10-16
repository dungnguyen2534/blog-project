"use client";

import useAuth from "@/hooks/useAuth";
import { Post } from "@/validation/schema/post";
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
import PostsAPI from "@/api/post";
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
import { useState } from "react";
import LoadingButton from "../LoadingButton";
import { useRouter } from "next/navigation";
import revalidateCachedData from "@/lib/revalidate";
import { BiShareAlt } from "react-icons/bi";
import PostAuthor from "./PostAuthor";
import useNavigation from "@/hooks/useNavigation";
import usePostsLoader from "@/hooks/usePostsLoader";

interface PostOptionsProps {
  post: Post;
  author: User;
  menuOnTop?: boolean;
  postEntry?: boolean;
}

export default function PostOptions({
  post,
  author,
  menuOnTop,
  postEntry,
}: PostOptionsProps) {
  const { user: LoggedInUser } = useAuth();
  const isAuthor = LoggedInUser?._id === author._id;

  const [isSaved, setIsSaved] = useState(post.isSavedPost);
  const [isBookmarking, setIsBookmarking] = useState(false);

  const { setPostList } = usePostsLoader();

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  const { toast } = useToast();

  function handleCopyLink() {
    navigator.clipboard.writeText(
      `${window.location.origin}/posts/${post.slug}`
    );
    toast({
      title: "Post link copied to clipboard",
    });
  }

  const router = useRouter();
  const { pathname, prevUrl } = useNavigation();

  async function bookmark() {
    if (!LoggedInUser) {
      toast({
        title: "Please sign in to bookmark this post",
      });
      return;
    }

    setIsBookmarking(true);
    try {
      if (isSaved) {
        await PostsAPI.unsavePost(post._id);
      } else {
        await PostsAPI.savePost(post._id);
      }
      setIsSaved((prev) => !prev);
      toast({
        title: isSaved ? "Post removed from bookmarks" : "Post bookmarked",
      });
    } catch {
      toast({
        title: "An error occurred",
        description: "Please try again later",
      });
    } finally {
      setIsBookmarking(false);
    }
  }

  async function deletePost() {
    setIsDeleting(true);

    try {
      await PostsAPI.deletePost(post._id);
      revalidateCachedData("/posts/" + post.slug);

      postEntry &&
        setPostList((prevList) => prevList.filter((p) => p._id !== post._id));

      if (pathname === "/posts/" + post.slug) {
        prevUrl === "/posts/create-post"
          ? router.push("/")
          : router.push(prevUrl || "/");
      }
    } catch (error) {
      setShowDialog(false);
      setIsDeleting(false);
      if (error instanceof UnauthorizedError) {
        toast({
          title: "Unauthorized",
          description: "You are not authorized to delete this post",
        });
      } else {
        toast({
          title: "An error occurred",
          description: "Please try again later",
        });
      }
    } finally {
      postEntry && setShowDialog(false);
    }
  }

  return (
    <div className="flex justify-between items-center">
      <PostAuthor post={post} postEntry />
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DropdownMenu modal={false}>
          <div
            className={`text-neutral-500 dark:text-neutral-400 ${
              menuOnTop ? "-mt-5" : ""
            }`}>
            <DropdownMenuTrigger aria-label="Post options">
              <div className="rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-100 p-2">
                <BsThreeDots size={20} />
              </div>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent>
            {!postEntry && (
              <DropdownMenuItem
                className="cursor-pointer flex items-center gap-2"
                onClick={bookmark}
                disabled={isBookmarking}>
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
                    href={`/posts/update-post/${post.slug}`}
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
            <DialogTitle>Are you sure to delete this post?</DialogTitle>
            <DialogDescription>
              This action cannot be undone, your post will be permanently
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
              onClick={deletePost}
              className="bg-red-600 hover:!bg-red-700 text-white"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
