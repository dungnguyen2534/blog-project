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
import { MdOutlineDeleteForever } from "react-icons/md";
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
import { usePathname, useRouter } from "next/navigation";
import revalidateCachedData from "@/lib/revalidate";
import { PiBookmarkSimpleBold } from "react-icons/pi";
import { BiShareAlt } from "react-icons/bi";
import PostAuthor from "./PostAuthor";
import usePostsLoader from "@/hooks/usePostsLoader";

interface PostOptionsProps {
  post: Post;
  author: User;
  menuOnTop?: boolean;
  previousUrl: string | null;
}

export default function PostOptions({
  post,
  author,
  menuOnTop,
  previousUrl,
}: PostOptionsProps) {
  const { user: LoggedInUser } = useAuth();
  const isAuthor = LoggedInUser?._id === author._id;

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
  const pathname = usePathname();

  const { setPostList } = usePostsLoader();

  async function deletePost() {
    setIsDeleting(true);

    try {
      await PostsAPI.deletePost(post._id);
      setShowDialog(false);

      setPostList((prevList) => {
        return prevList.filter((currentPost) => currentPost._id !== post._id);
      });

      revalidateCachedData("/posts/" + post.slug);
      if (pathname === "/posts/" + post.slug) {
        previousUrl === "/posts/create-post"
          ? router.push("/")
          : router.push(previousUrl || "/");
      }
    } catch (error) {
      setIsDeleting(false);
      if (error instanceof UnauthorizedError) {
        toast({
          title: "Unauthorized",
          description: "You are not authorized to delete this post",
        });
      } else {
        toast({
          title: "Error",
          description: "An error occurred, please try again later",
        });
      }
    }
  }

  return (
    <div className="flex justify-between items-center">
      <PostAuthor post={post} />
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DropdownMenu modal={false}>
          <div
            className={`text-neutral-500 dark:text-neutral-400 ${
              menuOnTop ? "-mt-5" : ""
            }`}>
            <DropdownMenuTrigger>
              <div className="rounded-full transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-700 dark:hover:text-neutral-100 p-2">
                <BsThreeDots size={20} />
              </div>
            </DropdownMenuTrigger>
          </div>
          <DropdownMenuContent>
            <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
              <PiBookmarkSimpleBold size={22} className="-ml-[0.35rem]" />
              Bookmark
            </DropdownMenuItem>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure to delete this post?</DialogTitle>
            <DialogDescription>
              This action cannot be undone, your post will be permanently
              deleted.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={() => setShowDialog(false)}>Turn back</Button>
            <LoadingButton
              loading={isDeleting}
              text="Sure, delete it"
              loadingText="Deleting..."
              onClick={deletePost}
              className="bg-red-600 dark:hover:bg-red-700 text-white"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
