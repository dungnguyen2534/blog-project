"use client";

import MarkdownEditor from "../form/MarkdownEditor";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CommentBody, CommentBodySchema } from "@/validation/schema/post";
import FormWrapper from "../form/FormWrapper";
import LoadingButton from "../LoadingButton";
import { useToast } from "../ui/use-toast";
import useAuth from "@/hooks/useAuth";
import UserAvatar from "../UserAvatar";
import useAuthDialogs from "@/hooks/useAuthDialogs";
import EditorGuideButton from "../EditorGuideButton";

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
  id?: string;
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
  id,
}: CommentFormProps) {
  const form = useForm<CommentBody>({
    resolver: zodResolver(CommentBodySchema),
    defaultValues: {
      body: defaultValue || "",
      images: [],
    },
  });

  const { user } = useAuth();
  const { showSignIn } = useAuthDialogs();
  const { isSubmitting, isDirty } = form.formState;

  const { toast } = useToast();
  function onInvalidComment() {
    if (!user) {
      showSignIn();
      return;
    }

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
          if (!user) {
            showSignIn();
            return;
          }

          if (!user.username) return;

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
          id={id}
          autoFocus={autoFocus}
          controller={form.control}
          name="body"
          showMenu={true}
          showPreview={false}
          height={`min(${height || "15.5rem"}, 70vh)`}
          forComment={{ postId }}
          placeholder="Share your thoughts..."
          className="transition-[outline] outline outline-2 outline-transparent focus-within:outline-neutral-500 dark:focus-within:outline-neutral-400"
        />
        <div className="flex justify-between items-center sm:flex-row gap-2">
          <LoadingButton
            className="font-semibold w-28 sm:w-36"
            text={submitBtnText || "Submit"}
            type="submit"
            loading={isSubmitting}
          />
          <EditorGuideButton />
        </div>
      </FormWrapper>
    </div>
  );
}
