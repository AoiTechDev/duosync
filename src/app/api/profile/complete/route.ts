import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth/options";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const profileData = await request.json();

    console.log("Profile data:", profileData);
    // Update user profile in database
    await db
      .update(users)
      .set({
        username: profileData.username?.toLowerCase(),
        region: profileData.region || null,
        summonerName: profileData.summonerName || null,
        // Handle null/undefined ranks (unranked players)
        soloRank:
          profileData.soloRank === "UNRANKED" || !profileData.soloRank
            ? null
            : profileData.soloRank,
        flexRank:
          profileData.flexRank === "UNRANKED" || !profileData.flexRank
            ? null
            : profileData.flexRank,
        mainRole: profileData.mainRole ? profileData.mainRole.toUpperCase() : null,
        secondaryRole: profileData.secondaryRole
          ? profileData.secondaryRole.toUpperCase()
          : null,
        playstyle: Array.isArray(profileData.playstyleTags)
          ? profileData.playstyleTags
          : [],
        communication: Array.isArray(profileData.communication)
          ? profileData.communication
          : [],
        goals: Array.isArray(profileData.goals) ? profileData.goals : [],
        bio: profileData.bio || "",
        updatedAt: new Date(),
      })
      .where(eq(users.email, session.user.email));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Profile completion error:", error);
    return NextResponse.json(
      { error: "Failed to complete profile" },
      { status: 500 }
    );
  }
}
