import type { Metadata } from "next";
import { getCurrentUser } from "@/auth";
import { redirect } from "next/navigation";
import { isProfileComplete } from "@/auth/utils";
import PostsList from "@/features/post-list/Posts";

export const metadata: Metadata = { title: "Duo feed" };

export default async function PostPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!isProfileComplete(user)) {
    redirect("/onboarding");
  }

  return (
    <div className="mx-auto w-full max-w-[1120px] px-5 pt-10 pb-20">
      <header className="mb-8">
        <h1 className="font-display text-[clamp(44px,7vw,84px)] font-black uppercase leading-[0.9] tracking-[-0.03em]">
          Duo <span className="text-primary">feed</span>
        </h1>
      </header>
      <PostsList user={user} />
    </div>
  );
}
