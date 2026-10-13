import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { rateLimit } from "@/lib/rate-limit";
import { usernameSchema } from "@/validators/profile-validator";

export async function POST(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const limit = await rateLimit("checkUsername", me.id);
    if (!limit.ok) {
      return NextResponse.json(
        { available: false, message: "Too many checks, slow down" },
        { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = usernameSchema.safeParse(body?.username);
    if (!parsed.success) {
      return NextResponse.json(
        { available: false, message: parsed.error.issues[0]?.message ?? "Invalid username" },
        { status: 400 },
      );
    }

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.username, parsed.data), ne(users.id, me.id)))
      .limit(1);

    return NextResponse.json({
      available: !existing,
      message: existing ? "Username is already taken" : "Username is available",
    });
  } catch (error) {
    console.error("Username check error:", error);
    return NextResponse.json({ available: false, message: "Failed to check username" }, { status: 500 });
  }
}
