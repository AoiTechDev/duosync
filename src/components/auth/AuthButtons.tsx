"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { SiDiscord } from "react-icons/si";
import { FlaskConical } from "lucide-react";

export function AuthButtons({ demo = false }: { demo?: boolean }) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Button variant="ghost" disabled className="w-full">
        Loading…
      </Button>
    );
  }

  if (!session) {
    return (
      <div className="flex flex-col gap-3">
        <Button
          variant="discord"
          className="w-full"
          onClick={() => signIn("discord", { callbackUrl: "/feed" })}
        >
          <SiDiscord className="size-5" />
          Continue with Discord
        </Button>
        <Button
          variant="light"
          className="w-full"
          onClick={() => signIn("google", { callbackUrl: "/feed" })}
        >
          <FcGoogle className="size-5" />
          Continue with Google
        </Button>
        {demo && (
          <>
            <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              Dev only
              <span className="h-px flex-1 bg-border" />
            </div>
            <Button
              variant="secondary"
              className="w-full"
              onClick={() => signIn("demo", { callbackUrl: "/feed" })}
            >
              <FlaskConical className="size-5" />
              Continue as demo player
            </Button>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">
        Signed in as <span className="text-foreground">{session.user?.name ?? session.user?.email}</span>
      </span>
      <Button variant="ghost" size="sm" onClick={() => signOut()}>
        Sign out
      </Button>
    </div>
  );
}
