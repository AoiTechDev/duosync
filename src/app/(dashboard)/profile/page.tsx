import type { Metadata } from "next";
import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { ProfileView } from "@/features/profile/ProfileView";

export const metadata: Metadata = { title: "Profile · DuoSync" };

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <ProfileView user={user} />;
}
