"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { SiDiscord } from "react-icons/si";

export function AuthButtons() {
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
          onClick={() => signIn("discord", { callbackUrl: "/posts" })}
        >
          <SiDiscord className="size-5" />
          Continue with Discord
        </Button>
        <Button
          variant="light"
          className="w-full"
          onClick={() => signIn("google", { callbackUrl: "/posts" })}
        >
          <FcGoogle className="size-5" />
          Continue with Google
        </Button>
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
