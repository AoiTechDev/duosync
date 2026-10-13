import type { Metadata } from "next";
import { getCurrentUser } from "@/auth";
import { redirect } from "next/navigation";
import { isProfileComplete } from "@/auth/utils";
import PostsList from "@/features/post-list/Posts";

export const metadata: Metadata = { title: "Duo feed · DuoSync" };

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
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <span className="size-1.5 animate-pulse rounded-full bg-electric shadow-[0_0_8px_var(--electric)]" />
          Live · looking for duo
        </div>
        <h1 className="mt-2 font-display text-[clamp(44px,7vw,84px)] font-black uppercase leading-[0.9] tracking-[-0.03em]">
          Duo <span className="text-primary">feed</span>
        </h1>
      </header>
      <PostsList user={user} />
    </div>
  );
}
