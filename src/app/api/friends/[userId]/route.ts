import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getCurrentUser } from "@/auth";
import { db } from "@/lib/db";
import { friendships } from "@/db/schema";

export async function DELETE(_request: Request, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { userId } = await params;
    if (!z.string().uuid().safeParse(userId).success) {
      return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
    }

    const [a, b] = me.id < userId ? [me.id, userId] : [userId, me.id];
    const [removed] = await db
      .delete(friendships)
      .where(and(eq(friendships.userAId, a), eq(friendships.userBId, b)))
      .returning({ id: friendships.id });

    if (!removed) {
      return NextResponse.json({ error: "You are not friends" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Remove friend error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
