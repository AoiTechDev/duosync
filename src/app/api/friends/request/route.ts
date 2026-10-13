import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, count, eq, gt, or, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/lib/db";
import { friendRequests, friendships, users } from "@/db/schema";
import { rateLimit } from "@/lib/rate-limit";

const MAX_PENDING_OUTBOUND = 30;
const MAX_REQUESTS_PER_DAY_TO_SAME_USER = 3;
const DAY_MS = 24 * 60 * 60 * 1000;

const BodySchema = z.object({
  toUserId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const limit = await rateLimit("friendRequest", me.id);
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

    const { toUserId } = parse.data;

    if (toUserId === me.id) {
      return NextResponse.json({ error: "Cannot send a request to yourself" }, { status: 400 });
    }

    const target = await db.query.users.findFirst({
      where: eq(users.id, toUserId),
      columns: { id: true },
    });
    if (!target) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [a, b] = me.id < toUserId ? [me.id, toUserId] : [toUserId, me.id];
    const existingFriendship = await db.query.friendships.findFirst({
      where: and(eq(friendships.userAId, a), eq(friendships.userBId, b)),
    });
    if (existingFriendship) {
      return NextResponse.json({ error: "Already friends" }, { status: 409 });
    }

    const pending = await db.query.friendRequests.findFirst({
      where: and(
        eq(friendRequests.status, "PENDING"),
        or(
          and(eq(friendRequests.senderId, me.id), eq(friendRequests.receiverId, toUserId)),
          and(eq(friendRequests.senderId, toUserId), eq(friendRequests.receiverId, me.id)),
        ),
      ),
    });
    if (pending) {
      const dir = pending.senderId === me.id ? "already sent" : "incoming request exists";
      return NextResponse.json({ error: `Pending request ${dir}` }, { status: 409 });
    }

    const dayAgo = new Date(Date.now() - DAY_MS);
    const [[outbound], [recentToTarget], declinedRecently] = await Promise.all([
      db
        .select({ n: count() })
        .from(friendRequests)
        .where(and(eq(friendRequests.senderId, me.id), eq(friendRequests.status, "PENDING"))),
      db
        .select({ n: count() })
        .from(friendRequests)
        .where(
          and(
            eq(friendRequests.senderId, me.id),
            eq(friendRequests.receiverId, toUserId),
            gt(friendRequests.createdAt, dayAgo),
          ),
        ),
      db.query.friendRequests.findFirst({
        where: and(
          eq(friendRequests.senderId, me.id),
          eq(friendRequests.receiverId, toUserId),
          eq(friendRequests.status, "DECLINED"),
          gt(friendRequests.createdAt, dayAgo),
        ),
        columns: { id: true },
      }),
    ]);
    if (outbound.n >= MAX_PENDING_OUTBOUND) {
      return NextResponse.json(
        { error: "Too many pending requests. Wait for some to be answered." },
        { status: 429 },
      );
    }
    if (declinedRecently || recentToTarget.n >= MAX_REQUESTS_PER_DAY_TO_SAME_USER) {
      return NextResponse.json({ error: "You can't send this player another request yet" }, { status: 429 });
    }

    const [created] = await db
      .insert(friendRequests)
      .values({ senderId: me.id, receiverId: toUserId, status: "PENDING" })
      .returning({ id: friendRequests.id, status: friendRequests.status });

    return NextResponse.json({ id: created.id, status: created.status, toUserId }, { status: 201 });
  } catch (err) {
    console.error("Friend request error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const direction = sp.get("direction") ?? "inbound";
  const countOnly = sp.get("countOnly") === "true";
  const requested = Number.parseInt(sp.get("limit") ?? "20", 10);
  const limit = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), 50) : 20;

  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const isInbound = direction !== "outbound";

    const items = await db.query.friendRequests.findMany({
      where: and(
        eq(friendRequests.status, "PENDING"),
        isInbound ? eq(friendRequests.receiverId, me.id) : eq(friendRequests.senderId, me.id),
      ),
      orderBy: (fr, { desc: d }) => [d(fr.createdAt), d(fr.id)],
      limit: countOnly ? undefined : limit,
    });

    const headers = { "Cache-Control": "no-store" } as const;

    if (countOnly) {
      return NextResponse.json({ count: items.length }, { status: 200, headers });
    }

    const counterpartIds = isInbound
      ? items.map((r) => r.senderId)
      : items.map((r) => r.receiverId);

    const counterpartUsers = counterpartIds.length
      ? await db
          .select({ id: users.id, username: users.username, image: users.image, soloRank: users.soloRank })
          .from(users)
          .where(inArray(users.id, counterpartIds))
      : [];

    const byId = new Map(counterpartUsers.map((u) => [u.id, u] as const));

    const responseItems = items.map((r) => {
      const otherId = isInbound ? r.senderId : r.receiverId;
      const otherUser = byId.get(otherId) || { id: otherId, username: null, image: null, soloRank: null };
      return {
        id: r.id,
        createdAt: r.createdAt,
        status: r.status,
        otherUser,
      };
    });

    return NextResponse.json({ items: responseItems, nextCursor: null }, { status: 200, headers });
  } catch (err) {
    console.error("List friend requests error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
