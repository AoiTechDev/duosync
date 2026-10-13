import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";

export async function POST() {
  const me = await getCurrentUser();
  if (!me) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await db.update(users).set({ lastSeenAt: new Date() }).where(eq(users.id, me.id));
  return new NextResponse(null, { status: 204 });
}
