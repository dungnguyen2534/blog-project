"use client";

import Link from "next/link";
import FormInput from "@/components/form/FormInput";
import FormWrapper from "@/components/form/FormWrapper";
import MarkdownEditor from "@/components/form/MarkdownEditor";
import TextField from "@/components/form/TextField";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { UnauthorizedError } from "@/lib/http-errors";
import { extractImageUrls, generateTags } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { revalidatePathData } from "@/lib/revalidate";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { RxQuestionMarkCircled } from "react-icons/rx";
import TextInput from "@/components/form/TextInput";
import {
  Article,
  ArticleBody,
  ArticleBodySchema,
} from "@/validation/schema/article";
import ArticlesAPI from "@/api/article";
import useArticlesLoader from "@/hooks/useArticlesLoader";
import useNavigation from "@/hooks/useNavigation";

interface ArticleUpdaterProps {
  article: Article;
}

export default function ArticleUpdater({ article }: ArticleUpdaterProps) {
  const form = useForm<ArticleBody>({
    resolver: zodResolver(ArticleBodySchema),
    defaultValues: {
      title: article.title,
      summary: article.summary,
      body: article.body,
      images: article.images,
    },
  });

  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setFirstPageFetched } = useArticlesLoader();
  const { setPrevScrollPosition } = useNavigation();

  const title = form.watch("title");
  const body = form.watch("body");
  const summary = form.watch("summary");

  const [tagsString, setTagsString] = useState(article.tags.join(" "));
  const [openDialog, setOpenDialog] = useState(false);

  async function onSubmit(values: ArticleBody) {
    if (
      title === article.title &&
      body === article.body &&
      summary === article.summary &&
      tagsString === article.tags.join(" ")
    ) {
      toast({
        title: "No changes detected",
        description: "You haven't made any changes to your article",
      });
      return;
    }

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
          title: "One or more tags are too long",
          description: "Each tag can't be more than 20 characters",
        });
        return;
      }
    }

    setIsSubmitting(true);
    const images = extractImageUrls(values.body);
    setFirstPageFetched(false);

    try {
      const { slug } = await ArticlesAPI.updateArticle(article._id, {
        ...values,
        tags,
        images,
      });

      revalidatePathData("/articles/" + article.slug);
      setPrevScrollPosition(0);
      router.push("/articles/" + slug);
    } catch (error) {
      setIsSubmitting(false);
      if (error instanceof UnauthorizedError) {
        toast({
          title: "Unauthorized",
          description: "You need to login to create a article",
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
    <div className="container px-1 sm:px-8 py-2 sm:py-4 mt-[4rem] md:!mt-[4.57rem]">
      <FormWrapper form={form} submitFunction={onSubmit}>
        <FormInput
          controller={form.control}
          name="title"
          placeholder="Your article title"
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
                    description:
                      "Your article can't be updated with no content",
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
                placeholder="Your article summary here..."
                description="This is optional but recommended"
                className="dark:bg-neutral-900 m-auto w-full"
                resizable={false}
                limit={180}
                showCharCount
              />

              <TextInput
                onChange={(e) => setTagsString(e.target.value)}
                label="Your article tags:"
                description="Example: #javascript #react #webdev"
                className="dark:bg-neutral-900"
                placeholder="Enter your article tags here... (5 tags at most)"
                defaultValue={tagsString}
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
    </div>
  );
}
