import { getCurrentUser } from "@/auth";
import { redirect } from "next/navigation";
import { isProfileComplete } from "@/auth/utils";
import OnboardingClient from "../../../components/onboarding/OnboardingClient";

export default async function OnboardingPage() {
  const user = await getCurrentUser();
  
  // If no user, middleware should have redirected to login
  // But let's be safe
  if (!user) {
    redirect("/login");
  }

  // Check if profile is complete
  if (isProfileComplete(user)) {
    redirect("/dashboard");
  }

  // Profile is incomplete, show onboarding
  return <OnboardingClient />;
}
