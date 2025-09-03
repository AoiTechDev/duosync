import { getCurrentUser } from "@/auth";
import { redirect } from "next/navigation";
import { isProfileComplete } from "@/auth/utils";
import OnboardingClient from "../../../components/onboarding/OnboardingClient";

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (isProfileComplete(user)) {
    redirect("/feed");
  }

  return <OnboardingClient />;
}
