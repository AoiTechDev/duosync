"use client";
import { useOnboardingStore } from "@/store/onboarding-store";
import BasicInfoStep from "./steps/BasicInfoStep";
import RiotAccountStep from "./steps/RiotAccountStep";
import PreferencesStep from "./steps/PreferencesStep";

export default function OnboardingWizard() {
  const currentStep = useOnboardingStore(state => state.currentStep);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BasicInfoStep />;
      case 2:
        return <RiotAccountStep />;
      case 3:
        return <PreferencesStep />;
      default:
        return <BasicInfoStep />;
    }
  };

  return renderStep();
}
