"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FormWrapper from "../form/FormWrapper";
import { useForm } from "react-hook-form";
import { SignUpBody, SignUpBodySchema } from "@/validation/schema/user";
import { zodResolver } from "@hookform/resolvers/zod";
import FormInput from "../form/FormInput";
import LoadingButton from "../LoadingButton";
import EmailInput from "../form/EmailInput";
import OTPInput from "../form/OTPInput";
import UserAPI from "@/api/user";
import useAuth from "@/hooks/useAuth";
import { BadRequestError, ConflictError } from "@/lib/http-errors";
import { useToast } from "../ui/use-toast";
import SocialSignin from "./SocialSignin";
import useCountDown from "@/hooks/useCountDown";
import { useState } from "react";

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
    resolver: zodResolver(SignUpBodySchema),
    defaultValues: { email: "", username: "", password: "", otp: "" },
  });

  const { mutateUser } = useAuth();
  const { toast } = useToast();

  async function onSubmit(input: SignUpBody) {
    if (!getOPTSuccess) {
      toast({
        title: "You haven't got OTP yet!",
        description: "Click get OTP button beside email input",
      });
      return;
    }

    try {
      const newUser = await UserAPI.signup(input);
      setGetOTPSuccess(false);
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

  const { trigger } = form;
  const { startCountDown, timeLeft } = useCountDown();
  const [isSendingOTP, setIsSendingOTP] = useState(false);
  const [getOPTSuccess, setGetOTPSuccess] = useState(false);

  async function getOTP() {
    const validEmail = await trigger("email");
    if (!validEmail) return;

    setIsSendingOTP(true);
    try {
      await UserAPI.getOTP(form.getValues("email"));
      setGetOTPSuccess(true);
      toast({
        title: "OTP sent!",
        description: "Please check your email",
      });
    } catch (error) {
      setGetOTPSuccess(false);
      setIsSendingOTP(false);
      if (error instanceof ConflictError) {
        toast({
          title: "Email already exists!",
          description: "Please sign in instead",
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
      <DialogContent className="border-0 sm:border-[1px] rounded-md w-dvw h-dvh sm:w-96 sm:h-auto py-5 px-auto overflow-auto flex flex-col justify-center">
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
              onEmailSubmit={getOTP}
              btnText="Get OTP"
              countDown={timeLeft}
              disabled={timeLeft > 0}
              loading={isSendingOTP}
            />
            <FormInput
              label="Username"
              controller={form.control}
              name="username"
              placeholder="Letters, numbers, and underscores"
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
            <SocialSignin />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
