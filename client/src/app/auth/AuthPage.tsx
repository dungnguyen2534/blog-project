"use client";

import ForgotPassword from "@/components/auth/ForgotPassword";
import SignIn from "@/components/auth/SignIn";
import SignUp from "@/components/auth/SignUp";
import useNavigation from "@/hooks/useNavigation";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthPage() {
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { prevUrl } = useNavigation();

  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (params.has("signup")) {
      setShowSignUp(true);
    } else if (params.has("signin")) {
      setShowSignIn(true);
    } else if (params.has("forgot-password")) {
      setShowForgotPassword(true);
    } else {
      setShowSignIn(true);
    }
  }, [params]);

  return (
    <main className="z-50 min-h-dvh w-full grid place-items-center bg-white dark:bg-black">
      <div className="container w-full sm:w-[30rem]">
        {!showSignIn && !showSignUp && !showForgotPassword && (
          <SignIn
            previousUrl={prevUrl}
            onSignUpClick={() => {
              setShowSignUp(true);
              setShowSignIn(false);
              router.replace("/auth?signup");
            }}
            onForgotPasswordClick={() => {
              setShowForgotPassword(true);
              setShowSignIn(false);
              router.replace("/auth?forgot-password");
            }}
          />
        )}

        {showSignIn && (
          <SignIn
            previousUrl={prevUrl}
            onSignUpClick={() => {
              setShowSignUp(true);
              setShowSignIn(false);
              router.replace("/auth?signup");
            }}
            onForgotPasswordClick={() => {
              setShowForgotPassword(true);
              setShowSignIn(false);
              router.replace("/auth?forgot-password");
            }}
          />
        )}

        {showSignUp && (
          <SignUp
            previousUrl={prevUrl}
            onSignInClick={() => {
              setShowSignUp(false);
              setShowSignIn(true);
              router.replace("/auth?signin");
            }}
          />
        )}

        {showForgotPassword && (
          <ForgotPassword
            previousUrl={prevUrl}
            onSignInClick={() => {
              setShowForgotPassword(false);
              setShowSignIn(true);
              router.replace("/auth?signin");
            }}
            onSignUpClick={() => {
              setShowForgotPassword(false);
              setShowSignUp(true);
              router.replace("/auth?signup");
            }}
          />
        )}
      </div>
    </main>
  );
}
