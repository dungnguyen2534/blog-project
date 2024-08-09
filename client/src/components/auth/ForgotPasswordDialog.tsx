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
      <DialogContent className="w-96 py-8 px-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Forgot password</DialogTitle>
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
          />
          <FormInput
            label="New password"
            controller={form.control}
            name="password"
            type="password"
            placeholder="At least 6 characters"
          />

          <OTPInput name="otp" controller={form.control} />

          <LoadingButton
            className="w-full mt-1"
            text="Reset password"
            loadingText="Resetting password..."
            loading={isSubmitting}
          />
        </FormWrapper>
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
