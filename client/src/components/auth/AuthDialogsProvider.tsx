"use client";

import { createContext, useMemo, useState } from "react";
import SignUpDialog from "./SignUpDialog";
import SignInDialog from "./SignInDialog";
import ForgotPasswordDialog from "./ForgotPasswordDialog";

interface AuthDialogsContext {
  showSignUp: () => void;
  showSignIn: () => void;
  showForgotPassword: () => void;
}

interface AuthDialogsProviderProps {
  children: React.ReactNode;
}

export const AuthDialogsContext = createContext<AuthDialogsContext>({
  showSignUp: () => {
    throw new Error("AuthDialogsProvider not implemented");
  },
  showSignIn: () => {
    throw new Error("AuthDialogsProvider not implemented");
  },
  showForgotPassword: () => {
    throw new Error("AuthDialogsProvider not implemented");
  },
});

export default function AuthDialogsProvider({
  children,
}: AuthDialogsProviderProps) {
  const [showSignUpDialog, setShowSignUpDialog] = useState(false);
  const [showSignInDialog, setShowSignInDialog] = useState(false);
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] =
    useState(false);

  const value = useMemo(
    () => ({
      showSignUp: () => setShowSignUpDialog(true),
      showSignIn: () => setShowSignInDialog(true),
      showForgotPassword: () => setShowForgotPasswordDialog(true),
    }),
    [setShowSignUpDialog, setShowSignInDialog, setShowForgotPasswordDialog]
  );

  return (
    <AuthDialogsContext.Provider value={value}>
      {children}
      <SignUpDialog
        show={showSignUpDialog}
        setShow={setShowSignUpDialog}
        onSignInClick={() => {
          setShowSignUpDialog(false);
          setShowSignInDialog(true);
        }}
      />
      <SignInDialog
        show={showSignInDialog}
        setShow={setShowSignInDialog}
        onSignUpClick={() => {
          setShowSignInDialog(false);
          setShowSignUpDialog(true);
        }}
        onForgotPasswordClick={() => {
          setShowSignInDialog(false);
          setShowForgotPasswordDialog(true);
        }}
      />
      <ForgotPasswordDialog
        show={showForgotPasswordDialog}
        setShow={setShowForgotPasswordDialog}
      />
    </AuthDialogsContext.Provider>
  );
}
