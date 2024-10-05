import React from "react";
import AuthPage from "./AuthPage";
import { headers } from "next/headers";

export default function page() {
  const referer = headers().get("referer");
  const previousUrl = referer ? new URL(referer).pathname : null;

  return <AuthPage previousUrl={previousUrl} />;
}
