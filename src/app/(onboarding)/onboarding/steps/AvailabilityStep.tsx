"use client";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/onboarding-store";

export default function AvailabilityStep() {
  const { prevStep } = useOnboardingStore();

  const handleComplete = async () => {
    // Here you would typically save the complete profile to your database
    // and then redirect to the main application
    console.log("Onboarding completed!");
    // You could also call a completion function from the store
    // completeOnboarding();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Availability</h2>
        <p className="text-gray-600">
          Set your gaming schedule to find duo partners at the right time
        </p>
      </div>

      <div className="bg-blue-50 p-8 rounded-lg text-center">
        <p className="text-blue-700">
          🚧 This step is coming soon! We&apos;ll add availability scheduling here.
        </p>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>
          Back
        </Button>
        <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
          Complete Setup
        </Button>
      </div>
    </div>
  );
} 