import type { Metadata } from "next";
import { getCurrentUser } from "@/auth";
import { redirect } from "next/navigation";
import { isProfileComplete } from "@/auth/utils";
import OnboardingClient from "../../../components/onboarding/OnboardingClient";

export const metadata: Metadata = { title: "Account setup · DuoGG" };

export default async function OnboardingPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (isProfileComplete(user)) {
    redirect("/posts");
  }

  return <OnboardingClient />;
}
