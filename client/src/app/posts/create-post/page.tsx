"use client";

import FormWrapper from "@/components/form/FormWrapper";
import FormInput from "@/components/form/FormInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createPostBody, PostBodySchema } from "@/validation/schema/post";
import PostsAPI from "@/api/post";
import { useRouter } from "next/navigation";
import MarkdownEditor from "@/components/form/MarkdownEditor";
import LoadingButton from "@/components/LoadingButton";
import { useToast } from "@/components/ui/use-toast";
import { TooManyRequestsError, UnauthorizedError } from "@/lib/http-errors";
import TextField from "@/components/form/TextField";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RxQuestionMarkCircled } from "react-icons/rx";
import { extractImageUrls } from "@/lib/utils";
import { useState } from "react";

export default function NewPostPage() {
  const form = useForm<createPostBody>({
    resolver: zodResolver(PostBodySchema),
    defaultValues: {
      title: "",
      summary: "",
      body: "",
      images: [],
    },
  });

  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const title = form.watch("title");
  const body = form.watch("body");

  async function onSubmit(values: createPostBody) {
    setIsSubmitting(true);
    const images = extractImageUrls(values.body);

    try {
      const { slug } = await PostsAPI.createPost({ ...values, images });
      router.push("/posts/" + slug);
    } catch (error) {
      setIsSubmitting(false);
      if (error instanceof UnauthorizedError) {
        toast({
          title: "Unauthorized",
          description: "You need to login to create a post",
        });
      } else if (error instanceof TooManyRequestsError) {
        toast({
          title: "Too many posts created",
          description: "You are creating too many posts, take a break",
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

  return (
    <main className="container px-1 sm:px-8 py-2 sm:py-4">
      <FormWrapper form={form} submitFunction={onSubmit}>
        <FormInput
          controller={form.control}
          name="title"
          placeholder="Your new post title here"
          className="p-8 pl-3 !text-2xl font-bold focus-visible:ring-0 focus-visible:ring-offset-0"
          autoComplete="off"
          limit={150}
        />

        <MarkdownEditor
          controller={form.control}
          name="body"
          placeholder="Write something awesome!"
        />

        <TextField
          controller={form.control}
          name="summary"
          placeholder="Add a short summary to make people curious..."
          className="focus-visible:ring-0 focus-visible:ring-offset-0  !-mt-4 rounded-tl-none rounded-tr-none dark:bg-neutral-900 m-auto w-full border-t-neutral-100 dark:border-t-[#1e1e1e]"
          resizable={false}
          limit={300}
        />
        <div className="flex justify-between items-center flex-col sm:flex-row gap-2">
          <LoadingButton
            className="font-semibold w-full sm:w-36"
            text="Publish"
            type="submit"
            loadingText="Publishing..."
            loading={isSubmitting}
            disabled={!title || !body}
          />
          <Button asChild variant="link">
            <Link
              className="text-sm text-[#5a5a5a] dark:text-neutral-400 flex items-center gap-1"
              href="https://www.markdownguide.org/cheat-sheet/"
              target="_blank"
              rel="noopener noreferrer">
              <RxQuestionMarkCircled size={22} />
              Don&apos;t know how to write markdown?
            </Link>
          </Button>
        </div>
      </FormWrapper>
    </main>
  );
}
