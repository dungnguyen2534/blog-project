"use client";

import React from "react";
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

interface CreateCommentBoxProps {
  postId: string;
  parentCommentId?: string;
}

export default function CreateCommentBox({
  postId,
  parentCommentId,
}: CreateCommentBoxProps) {
  const form = useForm<CreateCommentBody>({
    resolver: zodResolver(CommentBodySchema),
    defaultValues: {
      body: "",
      images: [],
    },
  });

  const { toast } = useToast();

  async function onSubmit(comment: CreateCommentBody) {
    const images = extractImageUrls(comment.body);

    try {
      await PostsAPI.createComment(postId, {
        body: comment.body,
        parentCommentId,
        images,
      });
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        toast({
          title: "Unauthorized",
          description: "You need to login to post a comment",
        });
      } else {
        console.log(error);
        toast({
          title: "Error",
          description: "An error occurred, please try again later",
        });
      }
    }
  }

  const { isSubmitting, isDirty } = form.formState;

  return (
    <section className="">
      <FormWrapper form={form} submitFunction={onSubmit}>
        <MarkdownEditor
          controller={form.control}
          name="body"
          showPreview={false}
          height="15rem"
          forComment={{ postId }}
        />
        <div className="flex justify-between items-center flex-col sm:flex-row gap-2">
          <LoadingButton
            className="font-semibold w-full sm:w-36"
            text="Submit"
            type="submit"
            loadingText="Submitting..."
            loading={isSubmitting}
            disabled={!isDirty}
          />
          <Button asChild variant="link">
            <Link
              className="text-sm text-[#5a5a5a] dark:text-neutral-400 flex items-center gap-1"
              href="https://www.markdownguide.org/cheat-sheet/"
              target="_blank"
              rel="noopener noreferrer">
              <RxQuestionMarkCircled size={22} />
              Markdown Cheat Sheet
            </Link>
          </Button>
        </div>
      </FormWrapper>
    </section>
  );
}
