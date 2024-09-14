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
import { extractImageUrls, generateTags } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogTrigger } from "@radix-ui/react-dialog";
import TextInput from "@/components/form/TextInput";

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

  const titleLimit = 150;
  useEffect(() => {
    if (title.length === titleLimit) {
      toast({
        title: "Title too long",
        description: `Title can't be more than ${titleLimit} characters`,
      });
    }
  }, [title, toast]);

  const [tagsString, setTagsString] = useState("");

  async function onSubmit(values: createPostBody) {
    let tags: string[] = [];

    if (tagsString.length > 0) {
      tags = generateTags(tagsString);
      if (tags.length > 5) {
        toast({
          title: "Too many tags",
          description: "You can't have more than 5 tags",
        });
        return;
      }

      if (tags.some((tag) => tag.length > 20)) {
        toast({
          title: "Some tags are too long",
          description: "Each tag can't be more than 20 characters",
        });
        return;
      }
    }

    setIsSubmitting(true);
    const images = extractImageUrls(values.body);

    try {
      const { slug } = await PostsAPI.createPost({ ...values, tags, images });
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
      <FormWrapper form={form}>
        <FormInput
          controller={form.control}
          name="title"
          placeholder="Your new post title..."
          className="p-8 pl-3 !text-2xl font-bold focus-visible:ring-0 focus-visible:ring-offset-0"
          autoComplete="off"
          limit={titleLimit}
        />

        <MarkdownEditor
          controller={form.control}
          name="body"
          placeholder="Write your post here!"
          height="65vh"
        />

        <div className="flex justify-between items-center flex-col sm:flex-row gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                className="font-semibold w-full sm:w-36"
                type="button"
                disabled={!title || !body}>
                Start Publishing
              </Button>
            </DialogTrigger>
            <DialogContent className="p-8 flex flex-col gap-2">
              <DialogTitle>Before publishing</DialogTitle>
              <DialogDescription className="-mt-1">
                Let&apos;s add some more information to your post.
              </DialogDescription>

              <TextField
                controller={form.control}
                name="summary"
                label="Add a short summary:"
                placeholder="Your post summary"
                description="This is optional but recommended"
                className="dark:bg-neutral-900 m-auto w-full"
                resizable={false}
                limit={180}
                showCharCount
              />

              <TextInput
                onChange={(e) => setTagsString(e.target.value)}
                label="Add some tags so people know what your post is about:"
                description="Example: #javascript #react #webdev"
                className="dark:bg-neutral-900"
                placeholder="Enter your post tags here... (5 tags at most)"
              />

              <LoadingButton
                className="font-semibold w-full sm:w-36"
                text="Publish"
                type="submit"
                loadingText="Publishing..."
                loading={isSubmitting}
                disabled={!title || !body}
                onClick={form.handleSubmit(onSubmit)}
              />
            </DialogContent>
          </Dialog>

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
    </main>
  );
}
