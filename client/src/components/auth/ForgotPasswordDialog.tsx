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
import {
  ForgotPasswordBody,
  ForgotPasswordBodySchema,
} from "@/validation/schema/user";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "../form/FormInput";
import LoadingButton from "../LoadingButton";
import EmailInput from "../form/EmailInput";
import OTPInput from "../form/OTPInput";
import SocialSignin from "./SocialSignin";
import useCountDown from "@/hooks/useCountDown";
import { useState } from "react";
import UserAPI from "@/api/user";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "@/lib/http-errors";
import { useToast } from "../ui/use-toast";
import useAuth from "@/hooks/useAuth";

interface ForgotPasswordDialogProps {
  show: boolean;
  setShow: (show: boolean) => void;
}

export default function ForgotPasswordDialog({
  show,
  setShow,
}: ForgotPasswordDialogProps) {
  const form = useForm<ForgotPasswordBody>({
    resolver: zodResolver(ForgotPasswordBodySchema),
    defaultValues: { email: "", password: "", otp: "" },
  });

  const { mutateUser } = useAuth();
  async function onSubmit(input: ForgotPasswordBody) {
    setGetOTPSuccess(false);

    try {
      const user = await UserAPI.resetPassword(input);
      mutateUser(user);
      setShow(false);
    } catch (error) {
      if (error instanceof NotFoundError) {
        toast({
          title: "No user found with this email",
          description: "Try remembering the email you used to sign up",
        });
      } else {
        toast({
          title: "An error occurred!",
          description: "Please try again later",
        });
      }
    }
  }

  const { toast } = useToast();
  const { trigger } = form;
  const { startCountDown, timeLeft } = useCountDown();
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [getOTPSuccess, setGetOTPSuccess] = useState(false);

  async function getResetPasswordOTP() {
    const validEmail = await trigger("email");
    if (!validEmail) return;

    setIsSendingOTP(true);
    try {
      await UserAPI.getResetPasswordOTP(form.getValues("email"));
      setGetOTPSuccess(true);
      toast({
        title: "OTP sent!",
        description: "Please check your email",
      });
    } catch (error) {
      setIsSendingOTP(false);
      if (error instanceof NotFoundError) {
        toast({
          title: "No user found with this email",
          description: "Try remembering the email you used to sign up",
        });
      } else {
        toast({
          title: "An error occurred!",
          description: "Please try again later",
        });
      }
    } finally {
      setIsSendingOTP(false);
      startCountDown();
    }
  }

  const { errors, isSubmitting } = form.formState;
  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="border-0 sm:border-[1px] rounded-md w-dvw h-dvh sm:w-96 sm:h-auto py-5 px-auto overflow-auto flex flex-col mb:justify-center">
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
              errorDescription={errors.email?.message}
              onEmailSubmit={getResetPasswordOTP}
              btnText="Get OTP"
              countDown={timeLeft}
              disabled={timeLeft > 0}
              loading={isSendingOTP}
              description="The email you used to create your account"
            />
            <FormInput
              label="New password"
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
              text="Reset password"
              loadingText="Resetting password..."
              type="submit"
              loading={isSubmitting}
              disabled={!getOTPSuccess}
            />
          </FormWrapper>
          <div className="text-xs uppercase text-center relative py-7">
            <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-950 px-2">
              Or continue with
            </span>
            <hr />
          </div>
          <SocialSignin />
        </div>
      </DialogContent>
    </Dialog>
  );
}
