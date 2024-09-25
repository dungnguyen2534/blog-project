"use client";

import MarkdownEditor from "../form/MarkdownEditor";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CommentBodySchema, CreateCommentBody } from "@/validation/schema/post";
import FormWrapper from "../form/FormWrapper";
import LoadingButton from "../LoadingButton";
import { Button } from "../ui/button";
import Link from "next/link";
import { RxQuestionMarkCircled } from "react-icons/rx";
import PostsAPI from "@/api/post";
import { extractImageUrls } from "@/lib/utils";
import { useToast } from "../ui/use-toast";
import { UnauthorizedError } from "@/lib/http-errors";
import useAuth from "@/hooks/useAuth";
import UserAvatar from "../UserAvatar";
import useCommentsLoader from "@/hooks/useCommentsLoader";

interface CreateCommentBoxProps {
  postId: string;
  parentCommentId?: string;
  noAvatar?: boolean;
}

export default function CreateCommentBox({
  postId,
  parentCommentId,
  noAvatar,
}: CreateCommentBoxProps) {
  const form = useForm<CreateCommentBody>({
    resolver: zodResolver(CommentBodySchema),
    defaultValues: {
      body: "",
      images: [],
    },
  });

  const { user } = useAuth();
  const { toast } = useToast();
  const { isSubmitting } = form.formState;

  const { setCommentList } = useCommentsLoader();

  async function onSubmit(comment: CreateCommentBody) {
    const images = extractImageUrls(comment.body);

    try {
      const newComment = await PostsAPI.createComment(postId, {
        body: comment.body,
        parentCommentId,
        images,
      });
      form.reset();
      setCommentList((prevCommentList) => [newComment, ...prevCommentList]);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        toast({
          title: "Unauthorized",
          description: "You need to login to post a comment",
        });
      } else {
        toast({
          title: "Error",
          description: "An error occurred, please try again later",
        });
      }
    }
  }

  function onInvalidComment() {
    toast({
      title: "Empty comment",
      description: "Please write something before submitting",
    });
  }

  return (
    <div className="flex gap-2">
      {!noAvatar && (
        <UserAvatar
          username={user?.username}
          profilePicUrl={user?.profilePicPath}
          className="mt-2 w-11 h-11"
        />
      )}
      <FormWrapper
        form={form}
        submitFunction={onSubmit}
        onInvalid={onInvalidComment}
        className="flex-grow">
        <MarkdownEditor
          controller={form.control}
          name="body"
          showMenu={true}
          showPreview={false}
          height="15.5rem"
          forComment={{ postId }}
          placeholder="Share your thoughts..."
          className="transition-[outline] outline outline-2 outline-transparent focus-within:outline-neutral-400 dark:focus-within:outline-neutral-400"
        />
        <div className="flex justify-between items-center sm:flex-row gap-2">
          <LoadingButton
            className="font-semibold w-full sm:w-36"
            text="Submit"
            type="submit"
            loading={isSubmitting}
          />
          <Button asChild variant="link">
            <Link
              className="text-sm text-[#5a5a5a] dark:text-neutral-400 flex items-center gap-1"
              href="/editor-guide"
              target="_blank">
              <RxQuestionMarkCircled size={22} />
              Editor Guide
            </Link>
          </Button>
        </div>
      </FormWrapper>
    </div>
  );
}
