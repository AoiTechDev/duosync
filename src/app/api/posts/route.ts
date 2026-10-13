import { getCurrentUser } from "@/auth";
import { friendships, posts, users } from "@/db/schema";
import { db } from "@/lib/db";
import { eq, desc, or } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const me = await getCurrentUser();
    if (!me) return;

    const friend = await db.query.friendships.findFirst({
      where: or(eq(friendships.userAId, me.id), eq(friendships.userBId, me.id)),
    });

    const postsResponse = await db
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
      .orderBy(desc(posts.createdAt));

    return NextResponse.json({ posts: postsResponse, friend: friend });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
