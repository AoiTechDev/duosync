"use client";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/onboarding-store";

export default function PreferencesStep() {
  const { nextStep, prevStep } = useOnboardingStore();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Game Preferences</h2>
        <p className="text-gray-600">
          Tell us about your preferred roles and playstyle
        </p>
      </div>

      <div className="bg-blue-50 p-8 rounded-lg text-center">
        <p className="text-blue-700">
          🚧 This step is coming soon! We&apos;ll add role selection and playstyle preferences here.
        </p>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button onClick={nextStep}>
          Continue
        </Button>
      </div>
    </div>
  );
} 