"use client";

import Link from "next/link";
import PostsAPI from "@/api/post";
import FormInput from "@/components/form/FormInput";
import FormWrapper from "@/components/form/FormWrapper";
import MarkdownEditor from "@/components/form/MarkdownEditor";
import TextField from "@/components/form/TextField";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { UnauthorizedError } from "@/lib/http-errors";
import { extractImageUrls } from "@/lib/utils";
import { createPostBody, Post, PostBodySchema } from "@/validation/schema/post";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BsMarkdown } from "react-icons/bs";
import revalidateCachedData from "@/lib/revalidate";

interface UpdatePostPageProps {
  post: Post;
}

export default function UpdatePost({ post }: UpdatePostPageProps) {
  const form = useForm<createPostBody>({
    resolver: zodResolver(PostBodySchema),
    defaultValues: {
      title: post.title,
      summary: post.summary,
      body: post.body,
      images: post.images,
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
      const { slug } = await PostsAPI.updatePost(post._id, {
        ...values,
        images,
      });

      revalidateCachedData("/posts/" + post.slug);
      router.push("/posts/" + slug);
    } catch (error) {
      setIsSubmitting(false);
      if (error instanceof UnauthorizedError) {
        toast({
          title: "Unauthorized",
          description: "You need to login to create a post",
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
            text="Update"
            type="submit"
            loadingText="Updating..."
            loading={isSubmitting}
            disabled={!title || !body}
          />
          <Button asChild variant="link">
            <Link
              className="text-sm text-[#5a5a5a] dark:text-neutral-400 flex items-center gap-1"
              href="https://www.markdownguide.org/cheat-sheet/"
              target="_blank"
              rel="noopener noreferrer">
              <BsMarkdown size={22} />
              Markdown cheat sheet
            </Link>
          </Button>
        </div>
      </FormWrapper>
    </main>
  );
}
