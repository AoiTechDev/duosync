import { getCurrentUser } from "@/auth";
import { friendRequests, friendships, posts, users } from "@/db/schema";
import { db } from "@/lib/db";
import { and, desc, eq, gt, or, sql } from "drizzle-orm";
import { POSTS_EXPIRE } from "@/lib/post-lifecycle";
import { NextResponse } from "next/server";

const FEED_LIMIT = 500;

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const [myFriendships, myPendingRequests, postsResponse] = await Promise.all([
      db
        .select({ userAId: friendships.userAId, userBId: friendships.userBId })
        .from(friendships)
        .where(or(eq(friendships.userAId, me.id), eq(friendships.userBId, me.id))),
      db
        .select({
          id: friendRequests.id,
          senderId: friendRequests.senderId,
          receiverId: friendRequests.receiverId,
        })
        .from(friendRequests)
        .where(
          and(
            eq(friendRequests.status, "PENDING"),
            or(eq(friendRequests.senderId, me.id), eq(friendRequests.receiverId, me.id)),
          ),
        ),
      db
        .select({
          id: posts.id,
          description: posts.description,
          isActive: posts.isActive,
          expiresAt: posts.expiresAt,
          bumpedAt: posts.bumpedAt,
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          rank: posts.rank,
          region: posts.region,
          role: posts.role,
          gameMode: posts.gameMode,
          authorId: posts.authorId,
          author: {
            id: users.id,
            username: users.username,
            image: users.image,
            avatar: users.avatar,
            summonerName: users.summonerName,
            soloRank: users.soloRank,
            flexRank: users.flexRank,
            mainRole: users.mainRole,
            secondaryRole: users.secondaryRole,
            lastSeenAt: users.lastSeenAt,
          },
        })
        .from(posts)
        .innerJoin(users, eq(posts.authorId, users.id))
        .where(
          and(
            eq(posts.isActive, true),
            POSTS_EXPIRE ? or(gt(posts.expiresAt, sql`now()`), eq(posts.authorId, me.id)) : undefined,
          ),
        )
        .orderBy(desc(posts.bumpedAt))
        .limit(FEED_LIMIT),
    ]);

    const friendIds = new Set(
      myFriendships.map((f) => (f.userAId === me.id ? f.userBId : f.userAId)),
    );
    const sentTo = new Set(
      myPendingRequests.filter((r) => r.senderId === me.id).map((r) => r.receiverId),
    );
    const incomingFrom = new Map(
      myPendingRequests.filter((r) => r.receiverId === me.id).map((r) => [r.senderId, r.id]),
    );

    const withRelation = postsResponse.map((rawPost) => {
      const authorId = rawPost.author.id;
      const canSeeRiotId = authorId === me.id || friendIds.has(authorId);
      const post = canSeeRiotId ? rawPost : { ...rawPost, author: { ...rawPost.author, summonerName: null } };
      if (authorId === me.id) return { ...post, relation: "self" as const };
      if (friendIds.has(authorId)) return { ...post, relation: "friend" as const };
      if (sentTo.has(authorId)) return { ...post, relation: "sent" as const };
      const requestId = incomingFrom.get(authorId);
      if (requestId) return { ...post, relation: "incoming" as const, requestId };
      return { ...post, relation: "none" as const };
    });

    return NextResponse.json({ posts: withRelation }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
