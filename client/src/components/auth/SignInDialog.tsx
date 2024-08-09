"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FormWrapper from "../form/FormWrapper";
import { useForm } from "react-hook-form";
import { SignInBody } from "@/validation/schema/user";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "../form/FormInput";
import LoadingButton from "../LoadingButton";
import GoogleButton from "./GoogleButton";
import GithubButton from "./GithubButton";
import EmailInput from "../form/EmailInput";
import OTPInput from "../form/OTPInput";

interface SignInDialogProps {
  show: boolean;
  setShow: (show: boolean) => void;
  onSignUpClick: () => void;
  onForgotPasswordClick: () => void;
}

export default function SignInDialog({
  show,
  setShow,
  onSignUpClick,
  onForgotPasswordClick,
}: SignInDialogProps) {
  const form = useForm<SignInBody>({
    resolver: zodResolver(SignInBody),
    defaultValues: { username: "", password: "" },
  });

  function onSubmit(values: SignInBody) {}

  const { errors, isSubmitting } = form.formState;

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="w-96 py-8 px-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Sign in</DialogTitle>
          <DialogDescription>
            Enter your credentials below to sign in
          </DialogDescription>
        </DialogHeader>
        <FormWrapper
          form={form}
          submitFunction={onSubmit}
          className="w-full m-auto">
          <FormInput
            label="Username"
            controller={form.control}
            name="username"
            placeholder="Your username"
          />

          <FormInput
            label="Password"
            controller={form.control}
            name="password"
            type="password"
            placeholder="Your password"
            alternative
            alternativeText="Forgot password?"
            alternativeAction={onForgotPasswordClick}
          />

          <LoadingButton
            className="w-full mt-1"
            text="Sign in"
            loadingText="Signing in..."
            loading={isSubmitting}
          />
        </FormWrapper>
        <div className="text-center text-sm">
          Don&apos;t have an account?
          <button
            onClick={onSignUpClick}
            className="text-blue-500 ml-1 underline">
            Sign up
          </button>
        </div>
        <div className="text-xs uppercase text-center relative py-2">
          <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-950 px-2">
            Or continue with
          </span>
          <hr />
        </div>
        <DialogFooter>
          <div className="flex gap-3 w-full justify-between">
            <GoogleButton /> <GithubButton />
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
