"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import FormWrapper from "../form/FormWrapper";
import { useForm } from "react-hook-form";
import { SignInBody } from "@/validation/schema/user";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "../form/FormInput";
import LoadingButton from "../LoadingButton";
import GoogleButton from "./GoogleButton";
import GithubButton from "./GithubButton";
import UserAPI from "@/api/user";
import useAuth from "@/hooks/useAuth";
import user from "@/api/user";
import { ToManyRequestError, UnauthorizedError } from "@/lib/http-errors";
import { error } from "console";

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

  const { mutateUser } = useAuth();
  const { toast } = useToast();

  async function onSubmit(credentials: SignInBody) {
    try {
      const user = await UserAPI.signin(credentials);
      mutateUser(user);
      setShow(false);
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        toast({
          title: "Invalid credentials",
          description: "Please check your credentials and try again",
        });
      } else if (error instanceof ToManyRequestError) {
        toast({
          title: "You're trying too often!",
          description: "Please try again later",
        });
      } else {
        console.error(error);
        toast({
          title: "An error occurred!",
          description: "Please try again later",
        });
      }
    }
  }

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
            errorDescription={errors.username?.message}
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
            errorDescription={errors.password?.message}
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
