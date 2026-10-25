import { redis } from "@/lib/redis";

// A per-user counter bumped whenever that user's conversation list changes (new message, read).
// Clients poll the counter, which is one Redis read, and refetch the full list only when it moves.
const KEY_TTL_SECONDS = 30 * 24 * 60 * 60;
const inboxKey = (userId: string) => `duogg:inbox:${userId}`;

export async function bumpInbox(...userIds: string[]) {
  if (!redis || userIds.length === 0) return;
  try {
    const pipeline = redis.pipeline();
    for (const id of userIds) {
      pipeline.incr(inboxKey(id));
      pipeline.expire(inboxKey(id), KEY_TTL_SECONDS);
    }
    await pipeline.exec();
  } catch (error) {
    console.error("Inbox bump failed:", error);
  }
}

/** Returns null when Redis isn't configured, so clients fall back to polling the full list. */
export async function getInboxVersion(userId: string): Promise<number | null> {
  if (!redis) return null;
  try {
    return (await redis.get<number>(inboxKey(userId))) ?? 0;
  } catch (error) {
    console.error("Inbox version read failed:", error);
    return null;
  }
}
