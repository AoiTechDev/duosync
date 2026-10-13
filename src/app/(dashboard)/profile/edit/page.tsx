import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/app/actions/auth";
import { EditProfileForm } from "./EditProfileForm";

export const metadata: Metadata = { title: "Edit profile · DuoSync" };

export default async function EditProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <EditProfileForm
      initial={{ username: user.username, region: user.region ?? "", bio: user.bio ?? "" }}
      summonerName={user.summonerName}
    />
  );
}
