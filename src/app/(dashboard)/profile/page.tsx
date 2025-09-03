import { getCurrentUser } from "@/app/actions/auth";
import { redirect } from "next/navigation";
import { ProfilePageClient } from "./ProfilePageClient";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return <ProfilePageClient user={user} />;
} 