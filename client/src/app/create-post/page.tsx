"use client";

import FormWrapper from "@/components/form/FormWrapper";
import FormInput from "@/components/form/FormInput";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createPostBody } from "@/validation/schema/post";
import PostsAPI from "@/api/post";
import { redirect, useRouter } from "next/navigation";

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
      console.log(res);
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
    errorMessage = "Both title and body are required";
  } else if (errors.body) {
    errorMessage = "Body is required";
  } else if (errors.title) {
    errorMessage = "Title is required";
  }

  return (
    <>
      {(errors.title || errors.body) && (
        <p className="font-semibold text-red-600 px-4 py-4 bg-red-600 bg-opacity-15  rounded-md mb-3">
          {errorMessage}
        </p>
      )}

      <FormWrapper form={form} submitFunction={onSubmit}>
        <FormInput
          controller={form.control}
          name="title"
          label="Title:"
          placeholder="Your post title"
        />
        <FormInput
          controller={form.control}
          name="body"
          label="Body:"
          placeholder="Your post body"
        />
        <Button disabled={isSubmitting} type="submit">
          Publish
        </Button>
      </FormWrapper>
    </>
  );
}
