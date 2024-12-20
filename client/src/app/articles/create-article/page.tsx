"use client";

import FormWrapper from "@/components/form/FormWrapper";
import FormInput from "@/components/form/FormInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArticleBody, ArticleBodySchema } from "@/validation/schema/article";
import ArticlesAPI from "@/api/article";
import { useRouter } from "next/navigation";
import MarkdownEditor from "@/components/form/MarkdownEditor";
import LoadingButton from "@/components/LoadingButton";
import { useToast } from "@/components/ui/use-toast";
import { TooManyRequestsError, UnauthorizedError } from "@/lib/http-errors";
import TextField from "@/components/form/TextField";
import { Button } from "@/components/ui/button";
import { extractImageUrls, generateTags } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import TextInput from "@/components/form/TextInput";
import useAutoSave from "@/hooks/useAutoSave";
import EditorGuideButton from "@/components/EditorGuideButton";
import useArticlesLoader from "@/hooks/useArticlesLoader";
import useNavigation from "@/hooks/useNavigation";
import { revalidatePathData } from "@/lib/revalidate";
import useAuth from "@/hooks/useAuth";

export default function NewArticlePage() {
  const form = useForm<ArticleBody>({
    resolver: zodResolver(ArticleBodySchema),
    defaultValues: {
      title: "",
      summary: "",
      body: "",
      images: [],
    },
  });

  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setFirstPageFetched } = useArticlesLoader();
  const { setPrevScrollPosition } = useNavigation();

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
  const [openDialog, setOpenDialog] = useState(false);

  const { getAutoSavedValue, clearAutoSavedValue } = useAutoSave(
    "new-article",
    {
      ...form.getValues(),
      ...{ tags: tagsString },
      ...{ images: [] }, // images are not saved
    }
  );

  useEffect(() => {
    const autoSavedValue = getAutoSavedValue();

    if (autoSavedValue) {
      form.reset({
        ...autoSavedValue,
        tags: [], // tags are saved as a string
      });

      setTagsString(autoSavedValue.tags);
    }
  }, [getAutoSavedValue, form]);

  async function onSubmit(values: ArticleBody) {
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
    setFirstPageFetched(false);

    try {
      const { slug } = await ArticlesAPI.createArticle({
        ...values,
        tags,
        images,
      });

      form.reset({
        title: "",
        summary: "",
        body: "",
        images: [],
      });
      clearAutoSavedValue();
      setPrevScrollPosition(0);

      revalidatePathData("/users/" + user?.username);
      router.push("/articles/" + slug);
    } catch (error) {
      setIsSubmitting(false);
      if (error instanceof UnauthorizedError) {
        toast({
          title: "Unauthorized",
          description: "You need to login to create a article",
        });
      } else if (error instanceof TooManyRequestsError) {
        toast({
          title: "Too many articles created",
          description: "You are creating too many articles, take a break",
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
      <FormWrapper form={form}>
        <FormInput
          controller={form.control}
          name="title"
          placeholder="Your new article title..."
          className="bg-white p-8 pl-3 !text-2xl font-bold focus-visible:ring-0 focus-visible:ring-offset-0"
          autoComplete="off"
          limit={titleLimit}
        />
        <MarkdownEditor
          controller={form.control}
          name="body"
          placeholder="Write your article here!"
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
                    description: "Please write something before publishing",
                  });
                } else {
                  setOpenDialog(true);
                }
              }}>
              Start Publishing
            </Button>

            <DialogContent className="p-8 flex flex-col gap-2">
              <DialogTitle>Before publishing</DialogTitle>
              <DialogDescription className="-mt-1">
                Let&apos;s add some more information to your article.
              </DialogDescription>

              <TextField
                controller={form.control}
                name="summary"
                label="Add a short summary:"
                placeholder="Your article summary"
                description="This is optional but recommended"
                className="dark:bg-neutral-950 m-auto w-full"
                resizable={false}
                limit={180}
                showCharCount
              />

              <TextInput
                onChange={(e) => setTagsString(e.target.value)}
                label="Add some tags so people know what your article is about:"
                description="Example: #javascript #react #webdev"
                placeholder="Enter your article tags here... (5 tags at most)"
                defaultValue={tagsString}
              />

              <LoadingButton
                className="font-semibold w-full sm:w-36"
                text="Publish"
                type="submit"
                loadingText="Publishing..."
                disabled={!title.trim() || !body.trim()}
                loading={isSubmitting}
                onClick={form.handleSubmit(onSubmit)}
              />
            </DialogContent>
          </Dialog>
          <EditorGuideButton />
        </div>
      </FormWrapper>
    </div>
  );
}
