import UserAPI from "@/api/user";
import EmailInput from "../form/EmailInput";
import FormInput from "../form/FormInput";
import FormWrapper from "../form/FormWrapper";
import OTPInput from "../form/OTPInput";
import LoadingButton from "../LoadingButton";
import SocialSignin from "./SocialSignin";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "@/lib/http-errors";
import useCountDown from "@/hooks/useCountDown";
import { useState } from "react";
import { useToast } from "../ui/use-toast";
import useAuth from "@/hooks/useAuth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { SignUpBody, SignUpBodySchema } from "@/validation/schema/user";
import { useRouter } from "next/navigation";

interface SignUp {
  previousUrl: string | undefined;
  onSignInClick: () => void;
}

export default function SignUp({ previousUrl, onSignInClick }: SignUp) {
  const form = useForm<SignUpBody>({
    resolver: zodResolver(SignUpBodySchema),
    defaultValues: { email: "", username: "", password: "", otp: "" },
  });

  const { mutateUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(input: SignUpBody) {
    setIsLoading(true);
    try {
      const newUser = await UserAPI.signup(input);
      mutateUser(newUser);
      router.push(previousUrl || "/");
      router.refresh();
    } catch (error) {
      setIsLoading(false);
      if (
        error instanceof ConflictError ||
        error instanceof BadRequestError ||
        error instanceof NotFoundError
      ) {
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

  async function getOTP() {
    const validEmail = await trigger("email");
    if (!validEmail) return;

    setIsSendingOTP(true);
    try {
      await UserAPI.getOTP(form.getValues("email"));
      toast({
        title: "OTP sent!",
        description: "Please check your email",
      });
    } catch (error) {
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

  const { errors } = form.formState;

  return (
    <>
      <div className="mb-3">
        <h1 className="text-4xl font-medium mb-1">Sign up</h1>
        <div>Enter your information below to create an account</div>
      </div>
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
          autoComplete="off"
        />
        <FormInput
          label="Username"
          controller={form.control}
          name="username"
          placeholder="Letters, numbers, and underscores"
          description="Your unique display name, can be changed later"
          errorDescription={errors.username?.message}
          autoComplete="off"
        />
        <FormInput
          label="Password"
          controller={form.control}
          name="password"
          type="password"
          placeholder="At least 6 characters"
          errorDescription={errors.password?.message}
          autoComplete="off"
        />

        <OTPInput
          name="otp"
          controller={form.control}
          errorDescription={errors.otp?.message}
        />

        <LoadingButton
          className="w-full mt-1"
          text="Sign up"
          loading={isLoading}
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
        <SocialSignin previousUrl={previousUrl} />
      </div>
    </>
  );
}
