"use client";

import { useSyncExternalStore } from "react";
import { useOnboardingStore } from "@/store/onboarding-store";
import BasicInfoStep from "./steps/BasicInfoStep";
import RiotAccountStep from "./steps/RiotAccountStep";
import PreferencesStep from "./steps/PreferencesStep";

function useHasHydrated() {
  return useSyncExternalStore(
    (onChange) => useOnboardingStore.persist.onFinishHydration(onChange),
    () => useOnboardingStore.persist.hasHydrated(),
    () => false,
  );
}

export default function OnboardingClient() {
  const currentStep = useOnboardingStore((state) => state.currentStep);
  const hydrated = useHasHydrated();

  if (!hydrated) return null;

  switch (currentStep) {
    case 2:
      return <RiotAccountStep />;
    case 3:
      return <PreferencesStep />;
    default:
      return <BasicInfoStep />;
  }
}
