import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/db/schema";

export const DEMO_EMAIL = "demo@duogg.test";

export function isDemoLoginEnabled() {
  return process.env.DEMO_LOGIN === "true" && process.env.VERCEL_ENV !== "production";
}

export async function getOrCreateDemoUser() {
  const [existing] = await db
    .select({ id: users.id, email: users.email, username: users.username })
    .from(users)
    .where(eq(users.email, DEMO_EMAIL))
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(users)
    .values({
      email: DEMO_EMAIL,
      username: "demo_player",
      summonerName: "DemoPlayer#EUW",
      region: "EUW1",
      soloRank: "PLATINUM_II",
      flexRank: "GOLD_I",
      mainRole: "JUNGLE",
      secondaryRole: "MID",
      bio: "Demo account for trying out DuoGG.",
      playstyle: ["aggressive"],
      communication: ["voice-discord"],
      goals: ["ranked-climbing"],
    })
    .returning({ id: users.id, email: users.email, username: users.username });
  return created;
}
