"use client";

import FormWrapper from "@/components/form/FormWrapper";
import FormInput from "@/components/form/FormInput";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createPostBody } from "@/validation/schema/post";
import PostsAPI from "@/api/post";
import { useRouter } from "next/navigation";
import MarkdownEditor from "@/components/form/MarkdownEditor";
import LoadingButton from "@/components/LoadingButton";
import { useToast } from "@/components/ui/use-toast";
import { UnauthorizedError } from "@/lib/http-errors";
import TextField from "@/components/form/TextField";

export default function NewPostPage() {
  const form = useForm<createPostBody>({
    resolver: zodResolver(createPostBody),
    defaultValues: {
      title: "",
      summary: "",
      body: "",
    },
  });

  const router = useRouter();
  const { toast } = useToast();

  async function onSubmit(values: createPostBody) {
    try {
      await PostsAPI.createPost(values);
      router.push("/");
      router.refresh();
    } catch (error) {
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

  const { isSubmitting } = form.formState;
  const title = form.watch("title");
  const body = form.watch("body");

  return (
    <>
      <FormWrapper form={form} submitFunction={onSubmit}>
        <FormInput
          controller={form.control}
          name="title"
          placeholder="New post title here"
          className="p-8 pl-3 text-2xl font-bold focus-visible:ring-0 focus-visible:ring-offset-0"
          autoComplete="off"
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
          className="focus-visible:ring-0 focus-visible:ring-offset-0  !-mt-4 rounded-tl-none rounded-tr-none dark:bg-neutral-900 m-auto w-full"
          resizable={false}
        />
        <div className="flex items-center gap-2">
          <LoadingButton
            className="ont-semibold"
            text="Publish"
            type="submit"
            loadingText="Publishing..."
            loading={isSubmitting}
            disabled={!title || !body}
          />
        </div>
      </FormWrapper>
    </>
  );
}
