import { after, NextRequest, NextResponse } from "next/server";
import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { getCurrentUser } from "@/auth";
import { db } from "@/lib/db";
import { friendships, messages } from "@/db/schema";
import { authorizeFriendship } from "@/lib/chat";
import { bumpInbox } from "@/lib/inbox";
import { publishMessage } from "@/lib/realtime";
import { rateLimit } from "@/lib/rate-limit";

type Params = { params: Promise<{ friendshipId: string }> };

const BodySchema = z.object({
  body: z.string().trim().min(1).max(2000),
});

const CursorSchema = z.string().uuid();

export async function GET(request: NextRequest, { params }: Params) {
  const sp = request.nextUrl.searchParams;

  const cursor = sp.get("cursor");
  const requested = Number.parseInt(sp.get("limit") ?? "30", 10);
  const limit = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), 50) : 30;

  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (cursor && !CursorSchema.safeParse(cursor).success) {
      return NextResponse.json({ error: "Invalid cursor" }, { status: 400 });
    }

    const { friendshipId } = await params;
    const auth = await authorizeFriendship(friendshipId, me.id);
    if ("error" in auth) return auth.error;

    // The cursor is the id of the oldest message already loaded; comparing against its row in SQL
    // keeps the full timestamp precision that a JS Date round-trip would truncate.
    const before = cursor
      ? sql`(${messages.createdAt}, ${messages.id}) < (
          select m.created_at, m.id from ${messages} m
          where m.id = ${cursor} and m.friendship_id = ${friendshipId}
        )`
      : undefined;

    const rows = await db
      .select()
      .from(messages)
      .where(and(eq(messages.friendshipId, friendshipId), before))
      .orderBy(desc(messages.createdAt), desc(messages.id))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return NextResponse.json({ items, nextCursor }, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("List messages error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const limit = await rateLimit("sendMessage", me.id);
    if (!limit.ok) {
      return NextResponse.json(
        { error: `Slow down, try again in ${limit.retryAfter}s` },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }

    const json = await request.json().catch(() => null);
    const parse = BodySchema.safeParse(json);
    if (!parse.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { friendshipId } = await params;
    const auth = await authorizeFriendship(friendshipId, me.id);
    if ("error" in auth) return auth.error;

    const created = await db.transaction(async (tx) => {
      const [message] = await tx
        .insert(messages)
        .values({ friendshipId, senderId: me.id, type: "TEXT", body: parse.data.body })
        .returning();
      await tx
        .update(friendships)
        // now() is fixed per transaction, so this matches the message's created_at exactly.
        .set({ lastMessageAt: sql`now()` })
        .where(eq(friendships.id, friendshipId));
      return message;
    });

    // Notify after responding so the sender never waits on Redis or Ably.
    after(() => Promise.all([bumpInbox(auth.otherUserId, me.id), publishMessage(auth.otherUserId, created)]));

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("Send message error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
