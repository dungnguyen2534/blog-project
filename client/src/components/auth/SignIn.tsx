import useAuth from "@/hooks/useAuth";
import { SignInBody, SignInBodySchema } from "@/validation/schema/user";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "../ui/use-toast";
import AuthAPI from "@/api/auth";
import { TooManyRequestsError, UnauthorizedError } from "@/lib/http-errors";
import FormWrapper from "../form/FormWrapper";
import FormInput from "../form/FormInput";
import LoadingButton from "../LoadingButton";
import SocialSignin from "./SocialSignin";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SignInProps {
  previousUrl: string | undefined;
  onSignUpClick: () => void;
  onForgotPasswordClick: () => void;
}

export default function SignIn({
  previousUrl,
  onSignUpClick,
  onForgotPasswordClick,
}: SignInProps) {
  const form = useForm<SignInBody>({
    resolver: zodResolver(SignInBodySchema),
    defaultValues: { username: "", password: "" },
  });

  const { mutateUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(credentials: SignInBody) {
    setIsLoading(true);

    try {
      const user = await AuthAPI.signin(credentials);
      mutateUser(user);

      sessionStorage.clear();
      router.push(previousUrl || "/");
      router.refresh();
    } catch (error) {
      setIsLoading(false);
      if (error instanceof UnauthorizedError) {
        toast({
          title: "Invalid username or password",
          description: "Please check your credentials and try again",
        });
      } else if (error instanceof TooManyRequestsError) {
        toast({
          title: "You're trying too often!",
          description: "Please try again later",
        });
      } else {
        toast({
          title: "An error occurred!",
          description: "Please try again later",
        });
      }
    }
  }

  const { errors } = form.formState;

  return (
    <>
      <div className="mb-8 sm:mb-3">
        <h1 className="font-medium text-4xl mb-2">Sign in</h1>
        <div>Enter your credentials below to sign in</div>
      </div>
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
          autoFocus
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
          loading={isLoading}
        />
      </FormWrapper>
      <div className="text-center text-sm mt-5">
        Don&apos;t have an account?
        <button
          onClick={onSignUpClick}
          className="text-blue-500 ml-1 underline">
          Sign up
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
