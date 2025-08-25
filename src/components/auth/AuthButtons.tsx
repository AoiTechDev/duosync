"use client";

import { useSession } from "next-auth/react";
import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { SiDiscord } from "react-icons/si";

export function AuthButtons() {
	const { data: session, status } = useSession();

	if (status === "loading") {
		return <Button variant="secondary" disabled className="w-full">Loading…</Button>;
	}

	if (!session) {
		return (
			<div className="flex flex-col gap-3">
				<Button onClick={() => signIn("google")} variant="default" className="w-full gap-2">
					<FcGoogle className="text-xl" />
					Sign in with Google
				</Button>
				<Button onClick={() => signIn("discord")} variant="secondary" className="w-full gap-2">
					<SiDiscord className="text-xl" />
					Sign in with Discord
				</Button>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-3">
			<span className="text-sm">{session.user?.name ?? session.user?.email}</span>
			<Button onClick={() => signOut()} variant="destructive">Sign out</Button>
		</div>
	);
} 