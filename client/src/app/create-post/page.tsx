"use client";

import FormWrapper from "@/components/form/FormWrapper";
import FormInput from "@/components/form/FormInput";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createPostBody } from "@/validation/schema/post";
import PostsAPI from "@/api/post";
import { useRouter } from "next/navigation";
import MarkdownEditor from "@/components/form/MarkdownEditor";
import LoadingButton from "@/components/LoadingButton";

export default function NewPostPage() {
  const form = useForm<createPostBody>({
    resolver: zodResolver(createPostBody),
    defaultValues: {
      title: "",
      body: "",
    },
  });

  const router = useRouter();

  async function onSubmit(values: createPostBody) {
    try {
      const res = await PostsAPI.createPost(values);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }

  const { errors, isSubmitting } = form.formState;

  let errorMessage = "";
  if (errors.title && errors.body) {
    errorMessage = "Both title and post content are required";
  } else if (errors.body) {
    errorMessage = "Body is required";
  } else if (errors.title) {
    errorMessage = "Title is required";
  }

  return (
    <>
      {(errors.title || errors.body) && (
        <p className="mb-3 rounded-md bg-red-600 bg-opacity-15 px-4 py-4 font-semibold text-red-600">
          {errorMessage}
        </p>
      )}

      <FormWrapper form={form} submitFunction={onSubmit}>
        <FormInput
          controller={form.control}
          name="title"
          placeholder="Your new post title here..."
          className="p-10 pl-3 text-4xl font-bold"
        />
        <MarkdownEditor
          controller={form.control}
          name="body"
          placeholder="Let write something awesome!"
        />
        <LoadingButton
          text="Publish"
          loadingText="Publishing..."
          loading={isSubmitting}
        />
      </FormWrapper>
    </>
  );
}
