import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getCurrentUser } from "@/auth";
import { db } from "@/lib/db";
import { friendRequests } from "@/db/schema";

const BodySchema = z.object({ requestId: z.string().uuid() });

export async function POST(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const parse = BodySchema.safeParse(await request.json().catch(() => null));
    if (!parse.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const [canceled] = await db
      .update(friendRequests)
      .set({ status: "CANCELED" })
      .where(
        and(
          eq(friendRequests.id, parse.data.requestId),
          eq(friendRequests.senderId, me.id),
          eq(friendRequests.status, "PENDING"),
        ),
      )
      .returning({ id: friendRequests.id });

    if (!canceled) {
      return NextResponse.json({ error: "No pending request to cancel" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Cancel friend request error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
