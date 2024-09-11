import { Suspense } from "react";
import OnboardingPage from "./page";

export default function OnboardingLayout() {
  return (
    <Suspense>
      <OnboardingPage />
    </Suspense>
  );
}
