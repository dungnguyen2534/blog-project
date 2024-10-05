"use client";

import { createContext, useMemo, useState } from "react";
import SignInDialog from "./SignInDialog";

interface AuthDialogsContext {
  showSignIn: () => void;
}

interface AuthDialogsProviderProps {
  children: React.ReactNode;
}

export const AuthDialogsContext = createContext<AuthDialogsContext>({
  showSignIn: () => {
    throw new Error("AuthDialogsProvider not implemented");
  },
});

export default function AuthDialogsProvider({
  children,
}: AuthDialogsProviderProps) {
  const [showSignInDialog, setShowSignInDialog] = useState(false);

  const value = useMemo(
    () => ({
      showSignIn: () => setShowSignInDialog(true),
    }),
    [, setShowSignInDialog]
  );

  return (
    <AuthDialogsContext.Provider value={value}>
      {children}
      <SignInDialog show={showSignInDialog} setShow={setShowSignInDialog} />
    </AuthDialogsContext.Provider>
  );
}
