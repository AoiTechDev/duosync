import { getCurrentUser } from "@/auth";
import { friendRequests, friendships, posts, users } from "@/db/schema";
import { db } from "@/lib/db";
import { and, desc, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";

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
          createdAt: posts.createdAt,
          updatedAt: posts.updatedAt,
          rank: posts.rank,
          region: posts.region,
          role: posts.role,
          authorId: posts.authorId,
          author: {
            id: users.id,
            username: users.username,
            name: users.name,
            image: users.image,
            avatar: users.avatar,
            summonerName: users.summonerName,
            soloRank: users.soloRank,
            flexRank: users.flexRank,
            mainRole: users.mainRole,
            secondaryRole: users.secondaryRole,
          },
        })
        .from(posts)
        .innerJoin(users, eq(posts.authorId, users.id))
        .where(eq(posts.isActive, true))
        .orderBy(desc(posts.createdAt)),
    ]);

    // A friendship row stores the pair sorted, so I can be on either side.
    const friendIds = new Set(
      myFriendships.map((f) => (f.userAId === me.id ? f.userBId : f.userAId)),
    );
    const sentTo = new Set(
      myPendingRequests.filter((r) => r.senderId === me.id).map((r) => r.receiverId),
    );
    const incomingFrom = new Map(
      myPendingRequests.filter((r) => r.receiverId === me.id).map((r) => [r.senderId, r.id]),
    );

    const withRelation = postsResponse.map((post) => {
      const authorId = post.author.id;
      if (authorId === me.id) return { ...post, relation: "self" as const };
      if (friendIds.has(authorId)) return { ...post, relation: "friend" as const };
      if (sentTo.has(authorId)) return { ...post, relation: "sent" as const };
      const requestId = incomingFrom.get(authorId);
      if (requestId) return { ...post, relation: "incoming" as const, requestId };
      return { ...post, relation: "none" as const };
    });

    return NextResponse.json({ posts: withRelation });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
