import React, { Suspense } from "react";
import AuthPage from "./AuthPage";

export default function page() {
  return (
    <Suspense>
      <AuthPage />
    </Suspense>
  );
}
