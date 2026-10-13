"use client";
import { OnboardingProgress } from "@/components/onboarding/OnboardingProgress";
import { BrandLogo } from "@/components/BrandLogo";
import { Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session) router.push("/login");
  }, [session, status, router]);

  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-background pb-10">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-[420px] left-1/2 size-[1000px] -translate-x-1/2 rounded-full bg-glow/20 blur-[160px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_3%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_3%,transparent)_1px,transparent_1px)] bg-size-[72px_72px] mask-[radial-gradient(ellipse_at_50%_0%,black_10%,transparent_70%)]" />
      </div>

      <header className="mx-auto flex w-full max-w-[1120px] items-center justify-between px-5 pt-6">
        <BrandLogo />
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Account setup
        </span>
      </header>

      {status === "loading" || !session ? (
        <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
          <Loader2 className="size-6 animate-spin" />
        </div>
      ) : (
        <>
          <div className="mt-8 px-5">
            <OnboardingProgress />
          </div>
          <main className="mt-12">{children}</main>
        </>
      )}
    </div>
  );
}
