import { NextResponse } from "next/server";
import { getCurrentUser } from "@/auth";
import { inboxChannel } from "@/features/chat/channels";
import { ablyRest } from "@/lib/realtime";

const TOKEN_TTL_MS = 60 * 60 * 1000;

// Ably's authUrl endpoint: issues a token request that can only subscribe to the caller's own inbox.
export async function POST() {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const client = ablyRest();
    if (!client) {
      return NextResponse.json({ error: "Realtime is not configured" }, { status: 503 });
    }

    const tokenRequest = await client.auth.createTokenRequest({
      clientId: me.id,
      capability: { [inboxChannel(me.id)]: ["subscribe"] },
      ttl: TOKEN_TTL_MS,
    });

    return NextResponse.json(tokenRequest, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("Realtime token error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
