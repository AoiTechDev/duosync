import { getCurrentUser } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import z from "zod";
import { friendRequests } from "@/db/schema";
import { and, eq } from "drizzle-orm";
const BodySchema = z.object({
  requestId: z.string().uuid(),
});

export async function POST(request: Request) {
  try {
    const me = await getCurrentUser();

    if (!me) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const json = await request.json().catch(() => null);
    const parse = BodySchema.safeParse(json);

    if (!parse.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { requestId } = parse.data;

    const fr = await db.query.friendRequests.findFirst({
      where: eq(friendRequests.id, requestId),
    });

    if (!fr) {
      return NextResponse.json({ error: "Friend request not found" }, { status: 404 });
    }

    if (fr.receiverId !== me.id) {
      return NextResponse.json(
        { error: "Only the receiver can decline this request" },
        { status: 403 },
      );
    }

    if (fr.status !== "PENDING") {
      return NextResponse.json(
        { error: "This friend request has already been handled" },
        { status: 409 },
      );
    }

    await db
      .update(friendRequests)
      .set({
        status: "DECLINED",
      })
      .where(and(eq(friendRequests.id, requestId), eq(friendRequests.status, "PENDING")));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
