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
import { ForgotPasswordBody } from "@/validation/schema/user";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "../form/FormInput";
import LoadingButton from "../LoadingButton";
import GoogleButton from "./GoogleButton";
import GithubButton from "./GithubButton";
import EmailInput from "../form/EmailInput";
import OTPInput from "../form/OTPInput";

interface ForgotPasswordDialogProps {
  show: boolean;
  setShow: (show: boolean) => void;
}

export default function ForgotPasswordDialog({
  show,
  setShow,
}: ForgotPasswordDialogProps) {
  const form = useForm<ForgotPasswordBody>({
    resolver: zodResolver(ForgotPasswordBody),
    defaultValues: { email: "", newPassword: "", otp: "" },
  });

  function onSubmit(input: ForgotPasswordBody) {}

  const { errors, isSubmitting } = form.formState;

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="border-0 sm:border-[1px] rounded-md w-[100dvw] h-[100dvh] sm:w-96 sm:h-auto py-5 px-auto overflow-auto flex flex-col mb:justify-center">
        <div className="mt-16 sm:mt-0">
          <DialogHeader className="mb-8 sm:mb-3">
            <DialogTitle className="text-2xl">Password recover</DialogTitle>
            <DialogDescription>
              Use the form below to reset your password
            </DialogDescription>
          </DialogHeader>
          <FormWrapper
            form={form}
            submitFunction={onSubmit}
            className="w-full m-auto">
            <EmailInput
              controller={form.control}
              description="The email you used to create your account"
              errorDescription={errors.email?.message}
            />
            <FormInput
              label="New password"
              controller={form.control}
              name="newPassword"
              type="password"
              placeholder="At least 6 characters"
              errorDescription={errors.newPassword?.message}
            />

            <OTPInput
              name="otp"
              controller={form.control}
              errorDescription={errors.otp?.message}
            />

            <LoadingButton
              className="w-full mt-1"
              text="Reset password"
              loadingText="Resetting password..."
              loading={isSubmitting}
            />
          </FormWrapper>
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
      </DialogContent>
    </Dialog>
  );
}
