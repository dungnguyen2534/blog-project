"use client";

import UserAPI from "@/api/user";
import FormInput from "@/components/form/FormInput";
import FormWrapper from "@/components/form/FormWrapper";
import LoadingButton from "@/components/LoadingButton";
import { useToast } from "@/components/ui/use-toast";
import useAuth from "@/hooks/useAuth";
import { OnboardingBody, OnboardingBodySchema } from "@/validation/schema/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export default function OnboardingPage() {
  const form = useForm<OnboardingBody>({
    resolver: zodResolver(OnboardingBodySchema),
    defaultValues: {
      username: "",
    },
  });

  const searchParams = useSearchParams();
  const router = useRouter();

  const { user, mutateUser } = useAuth();
  const { isDirty, isSubmitting } = form.formState;
  const { toast } = useToast();

  async function onSubmit(username: OnboardingBody) {
    try {
      const onboardingUser = await UserAPI.updateUser(username);
      mutateUser(onboardingUser);
    } catch (error) {
      toast({
        title: "An error occurred",
        description: "Please try again later",
      });
    }
  }

  useEffect(() => {
    if (user?.username) {
      const returnTo = decodeURIComponent(searchParams?.get("returnTo") || "");
      router.push(returnTo || "/");
    }
  }, [router, searchParams, user?.username]);

  return (
    <main className="container flex flex-col justify-center items-center sm:block p-8 w-screen">
      <h1 className="text-4xl font-bold">Onboarding</h1>
      <p className="mb-5 mt-1">
        Welcome, please enter your username to continue
      </p>
      <FormWrapper form={form} submitFunction={onSubmit}>
        <FormInput
          controller={form.control}
          name="username"
          placeholder="Your unique username"
          className="p-8 pl-3 !text-2xl font-bold focus-visible:ring-0 focus-visible:ring-offset-0"
          autoComplete="off"
          limit={20}
        />
        <LoadingButton
          className="w-full sm:w-fit"
          text="Continue"
          loadingText="Please wait"
          loading={isSubmitting}
          disabled={!isDirty}
          type="submit"
        />
      </FormWrapper>
    </main>
  );
}