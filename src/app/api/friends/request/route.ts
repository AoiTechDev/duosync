import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { and, eq, or, inArray } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/lib/db";
import { friendRequests, friendships, users } from "@/db/schema";

const BodySchema = z.object({
  toUserId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const json = await request.json().catch(() => null);
    const parse = BodySchema.safeParse(json);
    if (!parse.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const { toUserId } = parse.data;

    if (toUserId === me.id) {
      return NextResponse.json(
        { error: "Cannot send a request to yourself" },
        { status: 400 }
      );
    }

    const target = await db.query.users.findFirst({
      where: eq(users.id, toUserId),
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
          and(
            eq(friendRequests.senderId, me.id),
            eq(friendRequests.receiverId, toUserId)
          ),
          and(
            eq(friendRequests.senderId, toUserId),
            eq(friendRequests.receiverId, me.id)
          )
        )
      ),
    });
    if (pending) {
      const dir =
        pending.senderId === me.id ? "already sent" : "incoming request exists";
      return NextResponse.json(
        { error: `Pending request ${dir}` },
        { status: 409 }
      );
    }

    const [created] = await db
      .insert(friendRequests)
      .values({ senderId: me.id, receiverId: toUserId, status: "PENDING" })
      .returning({ id: friendRequests.id, status: friendRequests.status });

    return NextResponse.json(
      { id: created.id, status: created.status, toUserId },
      { status: 201 }
    );
  } catch (err) {
    console.error("Friend request error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;

  const direction = sp.get("direction") ?? "inbound"; // 'inbound' | 'outbound'
  const countOnly = sp.get("countOnly") === "true";   // boolean
  const limit = Math.min(Number(sp.get("limit") ?? "20"), 50);

  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const isInbound = direction !== "outbound";

    const items = await db.query.friendRequests.findMany({
      where: and(
        eq(friendRequests.status, "PENDING"),
        isInbound
          ? eq(friendRequests.receiverId, me.id)
          : eq(friendRequests.senderId, me.id)
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
          .select({ id: users.id, username: users.username, image: users.image })
          .from(users)
          .where(inArray(users.id, counterpartIds))
      : [];

    const byId = new Map(counterpartUsers.map((u) => [u.id, u] as const));

    const responseItems = items.map((r) => {
      const otherId = isInbound ? r.senderId : r.receiverId;
      const otherUser = byId.get(otherId) || { id: otherId, username: null, image: null };
      return {
        id: r.id,
        createdAt: r.createdAt,
        status: r.status,
        otherUser,
      };
    });

    return NextResponse.json(
      { items: responseItems, nextCursor: null },
      { status: 200, headers }
    );
  } catch (err) {
    console.error("List friend requests error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
