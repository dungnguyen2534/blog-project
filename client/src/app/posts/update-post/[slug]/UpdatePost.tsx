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
import { extractImageUrls, generateTags } from "@/lib/utils";
import { createPostBody, Post, PostBodySchema } from "@/validation/schema/post";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import revalidateCachedData from "@/lib/revalidate";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RxQuestionMarkCircled } from "react-icons/rx";
import TextInput from "@/components/form/TextInput";

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

  const [tagsString, setTagsString] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

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
      const { slug } = await PostsAPI.updatePost(post._id, {
        ...values,
        tags,
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
          placeholder="Your post title"
          className="p-8 pl-3 !text-2xl font-bold focus-visible:ring-0 focus-visible:ring-offset-0"
          autoComplete="off"
          limit={150}
        />

        <MarkdownEditor
          controller={form.control}
          name="body"
          placeholder="Write something new..."
          height="65vh"
        />

        <div className="flex justify-between items-center flex-col sm:flex-row gap-2">
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <Button
              className="font-semibold w-full sm:w-36"
              type="button"
              onClick={() => {
                if (!title.trim() || !body.trim()) {
                  toast({
                    title: "Title and body can't be empty",
                    description: "Your post can't be updated with no content",
                  });
                } else {
                  setOpenDialog(true);
                }
              }}>
              Start Updating
            </Button>
            <DialogContent className="p-8 flex flex-col gap-2">
              <DialogTitle>Before updating</DialogTitle>
              <DialogDescription className="-mt-1">
                Update or add a short summary if you haven&apos;t already
              </DialogDescription>

              <TextField
                controller={form.control}
                name="summary"
                placeholder="Your post summary here..."
                description="This is optional but recommended"
                className="dark:bg-neutral-900 m-auto w-full"
                resizable={false}
                limit={180}
                showCharCount
              />

              <TextInput
                onChange={(e) => setTagsString(e.target.value)}
                label="Your post tags:"
                description="Example: #javascript #react #webdev"
                className="dark:bg-neutral-900"
                placeholder="Enter your post tags here... (5 tags at most)"
                defaultValue={post.tags.join(" ")}
              />

              <LoadingButton
                className="font-semibold w-full sm:w-36"
                text="Update"
                type="submit"
                loadingText="Updating..."
                loading={isSubmitting}
                disabled={!title.trim() || !body.trim()}
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
