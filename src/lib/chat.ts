import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { friendships } from "@/db/schema";

const FriendshipIdSchema = z.string().uuid();

/**
 * Resolves a friendshipId path param for the given user. Returns the friendship when the user is
 * one of its two members, otherwise a ready-to-return error response.
 */
export async function authorizeFriendship(friendshipId: string, userId: string) {
  if (!FriendshipIdSchema.safeParse(friendshipId).success) {
    return { error: NextResponse.json({ error: "Invalid conversation id" }, { status: 400 }) } as const;
  }

  const friendship = await db.query.friendships.findFirst({
    where: eq(friendships.id, friendshipId),
    columns: { id: true, userAId: true, userBId: true },
  });
  if (!friendship) {
    return { error: NextResponse.json({ error: "Conversation not found" }, { status: 404 }) } as const;
  }
  if (friendship.userAId !== userId && friendship.userBId !== userId) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) } as const;
  }

  const otherUserId = friendship.userAId === userId ? friendship.userBId : friendship.userAId;
  return { friendship, otherUserId } as const;
}
