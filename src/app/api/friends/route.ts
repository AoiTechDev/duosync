import { NextResponse } from "next/server";
import { eq, inArray, or } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/lib/db";
import { friendships, users } from "@/db/schema";

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const rows = await db
      .select({ userAId: friendships.userAId, userBId: friendships.userBId, since: friendships.createdAt })
      .from(friendships)
      .where(or(eq(friendships.userAId, me.id), eq(friendships.userBId, me.id)));

    const sinceById = new Map(
      rows
        .map((r) => [r.userAId === me.id ? r.userBId : r.userAId, r.since] as const)
        .filter(([id]) => id !== me.id),
    );

    const friends = sinceById.size
      ? await db
          .select({
            id: users.id,
            username: users.username,
            image: users.image,
            avatar: users.avatar,
            summonerName: users.summonerName,
            region: users.region,
            soloRank: users.soloRank,
            flexRank: users.flexRank,
            mainRole: users.mainRole,
            lastSeenAt: users.lastSeenAt,
          })
          .from(users)
          .where(inArray(users.id, [...sinceById.keys()]))
      : [];

    const items = friends
      .map((f) => ({ ...f, since: sinceById.get(f.id)! }))
      .sort((x, y) => x.username.localeCompare(y.username));

    return NextResponse.json({ items }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("List friends error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
