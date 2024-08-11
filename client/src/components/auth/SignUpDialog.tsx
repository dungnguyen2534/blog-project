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
import { SignUpBody } from "@/validation/schema/user";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "../form/FormInput";
import LoadingButton from "../LoadingButton";
import GoogleButton from "./GoogleButton";
import GithubButton from "./GithubButton";
import EmailInput from "../form/EmailInput";
import OTPInput from "../form/OTPInput";
import UserAPI from "@/api/user";
import useAuth from "@/hooks/useAuth";
import { BadRequestError, ConflictError } from "@/lib/http-errors";
import { useToast } from "../ui/use-toast";

interface SignUpDialogProps {
  show: boolean;
  setShow: (show: boolean) => void;
  onSignInClick: () => void;
}

export default function SignUpDialog({
  show,
  setShow,
  onSignInClick,
}: SignUpDialogProps) {
  const form = useForm<SignUpBody>({
    resolver: zodResolver(SignUpBody),
    defaultValues: { email: "", username: "", password: "", otp: undefined },
  });

  const { mutateUser } = useAuth();
  const { toast } = useToast();

  async function onSubmit(input: SignUpBody) {
    try {
      const newUser = await UserAPI.signup(input);
      mutateUser(newUser);
      setShow(false);
    } catch (error) {
      if (error instanceof ConflictError || error instanceof BadRequestError) {
        toast({
          title: error.message,
        });
      } else {
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
      <DialogContent className="border-0 sm:border-[1px] rounded-md w-[100dvw] h-[100dvh] sm:w-96 sm:h-auto py-5 px-auto overflow-auto flex flex-col justify-center">
        <div>
          <DialogHeader className="mb-3">
            <DialogTitle className="text-2xl">Sign up</DialogTitle>
            <DialogDescription>
              Enter your information below to create an account
            </DialogDescription>
          </DialogHeader>
          <FormWrapper
            form={form}
            submitFunction={onSubmit}
            className="w-full m-auto">
            <EmailInput
              controller={form.control}
              errorDescription={errors.email?.message}
            />
            <FormInput
              label="Username"
              controller={form.control}
              name="username"
              placeholder="Only letters, numbers, and underscores"
              description="Your unique display name, you can change it later"
              errorDescription={errors.username?.message}
            />
            <FormInput
              label="Password"
              controller={form.control}
              name="password"
              type="password"
              placeholder="At least 6 characters"
              errorDescription={errors.password?.message}
            />

            <OTPInput
              name="otp"
              controller={form.control}
              errorDescription={errors.otp?.message}
            />

            <LoadingButton
              className="w-full mt-1"
              text="Sign up"
              loadingText="Signing up..."
              loading={isSubmitting}
            />
          </FormWrapper>
          <div className="text-center text-sm mt-5">
            Already have an account?
            <button
              onClick={onSignInClick}
              className="text-blue-500 ml-1 underline">
              Sign in
            </button>
            <div className="text-xs uppercase text-center relative py-7">
              <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-950 px-2">
                Or continue with
              </span>
              <hr />
            </div>
            <div className="flex gap-3 w-full justify-between">
              <GoogleButton /> <GithubButton />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
