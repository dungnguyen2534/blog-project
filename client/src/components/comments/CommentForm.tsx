"use client";

import MarkdownEditor from "../form/MarkdownEditor";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CommentBody, CommentBodySchema } from "@/validation/schema/post";
import FormWrapper from "../form/FormWrapper";
import LoadingButton from "../LoadingButton";
import { Button } from "../ui/button";
import Link from "next/link";
import { RxQuestionMarkCircled } from "react-icons/rx";
import { useToast } from "../ui/use-toast";
import useAuth from "@/hooks/useAuth";
import UserAvatar from "../UserAvatar";

interface CommentFormProps {
  postId: string;
  parentCommentId?: string;
  defaultValue?: string;
  noAvatar?: boolean;
  submitFunction: (comment: CommentBody) => Promise<void>;
  height?: string;
  autoFocus?: boolean;
  className?: string;
  submitBtnText?: string;
}

export default function CommentForm({
  postId,
  defaultValue,
  noAvatar,
  submitFunction,
  height,
  autoFocus,
  className,
  submitBtnText,
}: CommentFormProps) {
  const form = useForm<CommentBody>({
    resolver: zodResolver(CommentBodySchema),
    defaultValues: {
      body: defaultValue || "",
      images: [],
    },
  });

  const { user } = useAuth();
  const { isSubmitting, isDirty } = form.formState;

  const { toast } = useToast();
  function onInvalidComment() {
    toast({
      title: "Empty comment",
      description: "Please write something before submitting",
    });
  }

  return (
    <div className={`flex gap-2 ${className}`}>
      {!noAvatar && (
        <UserAvatar
          username={user?.username}
          profilePicUrl={user?.profilePicPath}
          className="mt-2 w-11 h-11"
        />
      )}
      <FormWrapper
        form={form}
        submitFunction={() => {
          if (!isDirty) {
            toast({
              title: "No changes detected",
              description: "Please edit your comment before submitting",
            });
            return;
          }
          return submitFunction(form.getValues());
        }}
        onInvalid={onInvalidComment}
        resetAfterSubmit
        className="flex-grow">
        <MarkdownEditor
          autoFocus={autoFocus}
          controller={form.control}
          name="body"
          showMenu={true}
          showPreview={false}
          height={`min(${height || "15.5rem"}, 70vh)`}
          forComment={{ postId }}
          placeholder="Share your thoughts..."
          className="transition-[outline] outline outline-2 outline-transparent focus-within:outline-neutral-400 dark:focus-within:outline-neutral-400"
        />
        <div className="flex justify-between items-center sm:flex-row gap-2">
          <LoadingButton
            className="font-semibold w-28 sm:w-36"
            text={submitBtnText || "Submit"}
            type="submit"
            loading={isSubmitting}
          />
          <Button asChild variant="link">
            <Link
              className="text-sm text-[#5a5a5a] dark:text-neutral-400 flex items-center gap-1"
              href="/editor-guide"
              target="_blank">
              <RxQuestionMarkCircled size={22} />
              <span className="hidden sm:block">Editor Guide</span>
            </Link>
          </Button>
        </div>
      </FormWrapper>
    </div>
  );
}
