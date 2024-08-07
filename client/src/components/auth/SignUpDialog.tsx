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
    defaultValues: { email: "", username: "", password: "", otp: "" },
  });

  async function onSubmit(input: SignUpBody) {
    try {
      const newUser = await UserAPI.signup(input);
      alert(JSON.stringify(newUser));
    } catch (error) {
      alert(error);
      console.log(error);
    }
  }

  const { errors, isSubmitting } = form.formState;

  return (
    <Dialog open={show} onOpenChange={setShow}>
      <DialogContent className="w-96 py-8 px-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Sign up</DialogTitle>
          <DialogDescription>
            Enter your information below to create an account
          </DialogDescription>
        </DialogHeader>
        <FormWrapper
          form={form}
          submitFunction={onSubmit}
          className="w-full m-auto">
          <EmailInput controller={form.control} />
          <FormInput
            label="Username"
            controller={form.control}
            name="username"
            placeholder="No spaces or special characters"
            description="Your unique display name, you can change it later"
          />
          <FormInput
            label="Password"
            controller={form.control}
            name="password"
            type="password"
            placeholder="At least 6 characters"
          />

          <OTPInput name="otp" controller={form.control} />

          <LoadingButton
            className="w-full mt-1"
            text="Sign up"
            loadingText="Signing up..."
            loading={isSubmitting}
          />
        </FormWrapper>
        <div className="text-center text-sm">
          Already have an account?
          <button
            onClick={onSignInClick}
            className="text-blue-500 ml-1 underline">
            Sign in
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
