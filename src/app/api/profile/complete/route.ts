import { NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { isProfileComplete } from "@/auth/utils";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { completeProfileSchema } from "@/validators/profile-validator";

export async function POST(request: Request) {
  try {
    const me = await getCurrentUser();
    if (!me) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    if (isProfileComplete(me)) {
      return NextResponse.json({ error: "Profile is already set up" }, { status: 409 });
    }

    const parsed = completeProfileSchema.safeParse(await request.json().catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid profile data", fields: parsed.error.issues.map((i) => i.path.join(".")) },
        { status: 400 },
      );
    }
    const data = parsed.data;

    const [taken] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.username, data.username), ne(users.id, me.id)))
      .limit(1);
    if (taken) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 409 });
    }

    await db
      .update(users)
      .set({
        username: data.username,
        region: data.region,
        mainRole: data.mainRole,
        secondaryRole: data.secondaryRole ?? null,
        playstyle: data.playstyleTags,
        communication: data.communication,
        goals: data.goals,
        bio: data.bio,
        updatedAt: new Date(),
      })
      .where(eq(users.id, me.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile completion error:", error);
    return NextResponse.json({ error: "Failed to complete profile" }, { status: 500 });
  }
}
