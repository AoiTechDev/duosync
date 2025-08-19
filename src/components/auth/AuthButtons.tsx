"use client";

import { useSession } from "next-auth/react";
import { signIn, signOut } from "next-auth/react";

export function AuthButtons() {
	const { data: session, status } = useSession();

	if (status === "loading") {
		return <button className="px-4 py-2 rounded bg-gray-200 text-gray-600" disabled>Loading…</button>;
	}

	if (!session) {
		return (
			<div className="flex gap-2">
				<button onClick={() => signIn("google")} className="px-4 py-2 rounded bg-black text-white">Sign in with Google</button>
				<button onClick={() => signIn("discord")} className="px-4 py-2 rounded bg-indigo-600 text-white">Sign in with Discord</button>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-3">
			<span className="text-sm">{session.user?.name ?? session.user?.email}</span>
			<button onClick={() => signOut()} className="px-4 py-2 rounded bg-gray-800 text-white">Sign out</button>
		</div>
	);
} 