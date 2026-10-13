import { and, eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { friendRequests, friendships } from "@/db/schema";
import type { PostRelation } from "@/lib/db";

export async function getRelation(
  meId: string,
  otherId: string,
): Promise<{ relation: PostRelation; requestId?: string }> {
  if (meId === otherId) return { relation: "self" };

  const [a, b] = meId < otherId ? [meId, otherId] : [otherId, meId];
  const [friendship, pending] = await Promise.all([
    db.query.friendships.findFirst({
      where: and(eq(friendships.userAId, a), eq(friendships.userBId, b)),
    }),
    db.query.friendRequests.findFirst({
      where: and(
        eq(friendRequests.status, "PENDING"),
        or(
          and(eq(friendRequests.senderId, meId), eq(friendRequests.receiverId, otherId)),
          and(eq(friendRequests.senderId, otherId), eq(friendRequests.receiverId, meId)),
        ),
      ),
    }),
  ]);

  if (friendship) return { relation: "friend" };
  if (pending?.senderId === meId) return { relation: "sent" };
  if (pending) return { relation: "incoming", requestId: pending.id };
  return { relation: "none" };
}
