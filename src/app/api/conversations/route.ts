import { NextResponse } from "next/server";
import { and, count, desc, eq, gt, inArray, isNull, ne, or, sql } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/lib/db";
import { conversationReads, friendships, messages, users } from "@/db/schema";

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const rows = await db
      .select({
        id: friendships.id,
        userAId: friendships.userAId,
        userBId: friendships.userBId,
        lastMessageAt: friendships.lastMessageAt,
      })
      .from(friendships)
      .where(or(eq(friendships.userAId, me.id), eq(friendships.userBId, me.id)))
      .orderBy(sql`${friendships.lastMessageAt} desc nulls last`, desc(friendships.createdAt));

    const headers = { "Cache-Control": "no-store" } as const;
    if (rows.length === 0) {
      return NextResponse.json({ items: [] }, { headers });
    }

    const friendshipIds = rows.map((r) => r.id);
    const otherIds = rows.map((r) => (r.userAId === me.id ? r.userBId : r.userAId));

    const [otherUsers, latest, unread] = await Promise.all([
      db
        .select({
          id: users.id,
          username: users.username,
          image: users.image,
          avatar: users.avatar,
          soloRank: users.soloRank,
          lastSeenAt: users.lastSeenAt,
        })
        .from(users)
        .where(inArray(users.id, otherIds)),
      db
        .selectDistinctOn([messages.friendshipId], {
          id: messages.id,
          friendshipId: messages.friendshipId,
          senderId: messages.senderId,
          type: messages.type,
          body: messages.body,
          createdAt: messages.createdAt,
        })
        .from(messages)
        .where(inArray(messages.friendshipId, friendshipIds))
        .orderBy(messages.friendshipId, desc(messages.createdAt), desc(messages.id)),
      db
        .select({ friendshipId: messages.friendshipId, n: count() })
        .from(messages)
        .leftJoin(
          conversationReads,
          and(eq(conversationReads.friendshipId, messages.friendshipId), eq(conversationReads.userId, me.id)),
        )
        .where(
          and(
            inArray(messages.friendshipId, friendshipIds),
            ne(messages.senderId, me.id),
            or(isNull(conversationReads.lastReadAt), gt(messages.createdAt, conversationReads.lastReadAt)),
          ),
        )
        .groupBy(messages.friendshipId),
    ]);

    const userById = new Map(otherUsers.map((u) => [u.id, u] as const));
    const latestById = new Map(latest.map(({ friendshipId, ...m }) => [friendshipId, m] as const));
    const unreadById = new Map(unread.map((u) => [u.friendshipId, u.n] as const));

    const items = rows.map((r, i) => ({
      friendshipId: r.id,
      otherUser: userById.get(otherIds[i]) ?? {
        id: otherIds[i],
        username: "Unknown",
        image: null,
        avatar: null,
        soloRank: null,
        lastSeenAt: null,
      },
      lastMessage: latestById.get(r.id) ?? null,
      lastMessageAt: r.lastMessageAt,
      unreadCount: unreadById.get(r.id) ?? 0,
    }));

    return NextResponse.json({ items }, { headers });
  } catch (err) {
    console.error("List conversations error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
