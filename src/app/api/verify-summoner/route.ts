import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth/options";
import { db } from "@/lib/db";
import { rankEnum, users, type Rank } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  getAccountByRiotId,
  getLeagueEntriesByPuuid,
  getSummonerByPuuid,
  isRiotRegion,
  RiotError,
  type RiotLeagueEntry,
} from "@/lib/riot";

const APEX_TIERS = ["MASTER", "GRANDMASTER", "CHALLENGER"];

function toRank(entry: RiotLeagueEntry | undefined): Rank | null {
  if (!entry) return null;
  const value = APEX_TIERS.includes(entry.tier) ? entry.tier : `${entry.tier}_${entry.rank}`;
  return (rankEnum.enumValues as readonly string[]).includes(value) ? (value as Rank) : null;
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { gameName, tagLine, region } = await request.json();

  if (!isRiotRegion(region)) {
    return NextResponse.json({ success: false, message: "Invalid region" }, { status: 400 });
  }

  try {
    let account;
    try {
      account = await getAccountByRiotId(region, gameName, tagLine);
    } catch (e) {
      if (e instanceof RiotError && e.status === 404) {
        return NextResponse.json({ success: false, message: "Account not found" });
      }
      throw e;
    }

    let summoner;
    try {
      summoner = await getSummonerByPuuid(region, account.puuid);
    } catch (e) {
      if (e instanceof RiotError && e.status === 404) {
        return NextResponse.json({ success: false, message: "Summoner not found for this region" });
      }
      throw e;
    }

    let soloRank: Rank | null = null;
    let flexRank: Rank | null = null;

    try {
      const entries = await getLeagueEntriesByPuuid(region, account.puuid);
      soloRank = toRank(entries.find((entry) => entry.queueType === "RANKED_SOLO_5x5"));
      flexRank = toRank(entries.find((entry) => entry.queueType === "RANKED_FLEX_SR"));
    } catch (e) {
      console.error("Riot league lookup failed:", e);
    }

    const summonerName = `${account.gameName}#${account.tagLine}`;

    await db
      .update(users)
      .set({ summonerName, soloRank, flexRank, updatedAt: new Date() })
      .where(eq(users.email, session.user.email));

    return NextResponse.json({
      success: true,
      data: {
        summonerName,
        gameName: account.gameName,
        tagLine: account.tagLine,
        level: summoner.summonerLevel,
        soloRank,
        flexRank,
      },
    });
  } catch (error) {
    if (error instanceof RiotError) {
      console.error("Riot API error:", error.status, error.message);
      return NextResponse.json({ success: false, message: error.message }, { status: error.status });
    }
    console.error("Verify summoner failed:", error);
    return NextResponse.json(
      { success: false, message: "Failed to verify summoner" },
      { status: 500 },
    );
  }
}
