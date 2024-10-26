import { useForm } from "react-hook-form";
import EmailInput from "../form/EmailInput";
import FormInput from "../form/FormInput";
import FormWrapper from "../form/FormWrapper";
import OTPInput from "../form/OTPInput";
import LoadingButton from "../LoadingButton";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ForgotPasswordBody,
  ForgotPasswordBodySchema,
} from "@/validation/schema/user";
import useAuth from "@/hooks/useAuth";
import UserAPI from "@/api/user";
import { ConflictError, NotFoundError } from "@/lib/http-errors";
import { useToast } from "../ui/use-toast";
import useCountDown from "@/hooks/useCountDown";
import { useState } from "react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";

interface ForgotPasswordProps {
  previousUrl: string | undefined;
  onSignInClick: () => void;
  onSignUpClick: () => void;
}

export default function ForgotPassword({
  previousUrl,
  onSignInClick,
  onSignUpClick,
}: ForgotPasswordProps) {
  const form = useForm<ForgotPasswordBody>({
    resolver: zodResolver(ForgotPasswordBodySchema),
    defaultValues: { email: "", password: "", otp: "" },
  });

  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const { mutateUser } = useAuth();
  async function onSubmit(input: ForgotPasswordBody) {
    setIsLoading(true);
    try {
      const user = await UserAPI.resetPassword(input);
      mutateUser(user);
      router.push(previousUrl || "/");
      router.refresh();
    } catch (error) {
      setIsLoading(false);
      if (error instanceof NotFoundError) {
        toast({
          title: error.message,
        });
      } else if (error instanceof ConflictError) {
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

  const { toast } = useToast();
  const { trigger } = form;
  const { startCountDown, timeLeft } = useCountDown();
  const [isSendingOTP, setIsSendingOTP] = useState(false);

  async function getResetPasswordOTP() {
    const validEmail = await trigger("email");
    if (!validEmail) return;

    setIsSendingOTP(true);
    try {
      await UserAPI.getResetPasswordOTP(form.getValues("email"));
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

  const { errors } = form.formState;

  return (
    <div>
      <div className="mb-8 sm:mb-3">
        <h1 className="text-4xl font-medium mb-1">Password recover</h1>
        <div>Use the form below to reset your password</div>
      </div>
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
          type="submit"
          loading={isLoading}
        />
      </FormWrapper>
      <div className="text-xs uppercase text-center relative py-7">
        <span className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-neutral-950 px-2">
          or back to
        </span>
        <hr />
      </div>
      <div className="flex justify-between gap-3">
        <Button variant="outline" className="w-full" onClick={onSignInClick}>
          Sign in
        </Button>
        <Button variant="outline" className="w-full" onClick={onSignUpClick}>
          Sign up
        </Button>
      </div>
    </div>
  );
}
