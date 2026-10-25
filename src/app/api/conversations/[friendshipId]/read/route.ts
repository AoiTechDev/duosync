import { after, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/lib/db";
import { conversationReads } from "@/db/schema";
import { authorizeFriendship } from "@/lib/chat";
import { bumpInbox } from "@/lib/inbox";

export async function POST(_request: Request, { params }: { params: Promise<{ friendshipId: string }> }) {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { friendshipId } = await params;
    const auth = await authorizeFriendship(friendshipId, me.id);
    if ("error" in auth) return auth.error;

    const [read] = await db
      .insert(conversationReads)
      .values({ friendshipId, userId: me.id })
      .onConflictDoUpdate({
        target: [conversationReads.friendshipId, conversationReads.userId],
        set: { lastReadAt: sql`now()` },
      })
      .returning({ lastReadAt: conversationReads.lastReadAt });

    // Lets this user's other tabs and devices drop the unread badge.
    after(() => bumpInbox(me.id));

    return NextResponse.json({ ok: true, lastReadAt: read.lastReadAt });
  } catch (err) {
    console.error("Mark conversation read error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
