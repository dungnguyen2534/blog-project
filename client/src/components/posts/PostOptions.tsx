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
import { IoBookmarkOutline } from "react-icons/io5";
import UserAvatar from "../UserAvatar";
import { formatDate, formatUpdatedDate } from "@/lib/utils";
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
import env from "@/validation/env-validation";

interface PostOptionsProps {
  post: Post;
  author: User;
  menuOnTop?: boolean;
}

export default function PostOptions({
  post,
  author,
  menuOnTop,
}: PostOptionsProps) {
  const { user: LoggedInUser } = useAuth();
  const isAuthor = LoggedInUser?._id === author._id;

  const { toast } = useToast();
  const router = useRouter();

  const [isDeleting, setIsDeleting] = useState(false);
  const [show, setShow] = useState(false);

  async function deletePost() {
    setIsDeleting(true);

    try {
      await PostsAPI.deletePost(post._id);
      setShow(false);

      revalidateCachedData("/posts/" + post.slug);
      router.push("/");
      router.refresh();
    } catch (error) {
      setIsDeleting(false);
      if (error instanceof UnauthorizedError) {
        toast({
          title: "Unauthorized",
          description: "You are not authorized to delete this post",
        });
      } else {
        toast({ title: "Error", description: "Failed to delete the post" });
      }
    }
  }

  let postDate;
  if (!(post.createdAt !== post.updatedAt)) {
    postDate = (
      <time
        className="text-xs text-neutral-500 dark:text-neutral-400"
        dateTime={post.createdAt}>
        {formatDate(post.createdAt)}
      </time>
    );
  } else {
    postDate = (
      <time
        className="text-xs text-neutral-500 dark:text-neutral-400"
        dateTime={post.createdAt}>
        {`${formatDate(post.createdAt, false)} - ${formatUpdatedDate(
          post.updatedAt
        )}`}
      </time>
    );
  }

  return (
    <div className="flex justify-between items-center">
      <Link
        href={"/users/" + post.author.username}
        className="flex gap-2 items-center">
        <UserAvatar
          username={post.author.username}
          profilePicUrl={
            env.NEXT_PUBLIC_SERVER_URL + post.author.profilePicPath
          }
        />
        <div className="flex flex-col justify-center">
          <span className="text-sm">{post.author.username}</span>
          {postDate}
        </div>
      </Link>
      <Dialog open={show} onOpenChange={setShow}>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger>
            <div
              className={`w-fit p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors rounded-full -mr-2 ${
                menuOnTop ? "-mt-7" : ""
              }`}>
              <BsThreeDots
                size={20}
                className="text-neutral-500 dark:text-neutral-400 "
              />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
              <IoBookmarkOutline size={20} className="-ml-1" />
              Bookmark
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
            <Button onClick={() => setShow(false)}>Turn back</Button>
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
