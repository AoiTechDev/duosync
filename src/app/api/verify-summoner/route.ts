import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/auth/options";
import { db } from "@/lib/db";
import { rankEnum, users, type Rank } from "@/db/schema";
import { eq } from "drizzle-orm";

const RIOT_API_KEY = process.env.RIOT_API_KEY;
const REGION_ENDPOINTS = {
  NA1: "na1.api.riotgames.com",
  EUW1: "euw1.api.riotgames.com",
  EUN1: "eun1.api.riotgames.com",
  KR: "kr.api.riotgames.com",
  BR1: "br1.api.riotgames.com",
  LA1: "la1.api.riotgames.com",
  LA2: "la2.api.riotgames.com",
  OC1: "oc1.api.riotgames.com",
  RU: "ru.api.riotgames.com",
  TR1: "tr1.api.riotgames.com",
  JP1: "jp1.api.riotgames.com",
};

const REGIONAL_ENDPOINTS = {
  NA1: "americas.api.riotgames.com",
  EUW1: "europe.api.riotgames.com",
  EUN1: "europe.api.riotgames.com",
  KR: "asia.api.riotgames.com",
  BR1: "americas.api.riotgames.com",
  LA1: "americas.api.riotgames.com",
  LA2: "americas.api.riotgames.com",
  OC1: "sea.api.riotgames.com",
  RU: "europe.api.riotgames.com",
  TR1: "europe.api.riotgames.com",
  JP1: "asia.api.riotgames.com",
};

interface RankedEntry {
  leagueId: string;
  queueType: string;
  tier: string;
  rank: string;
  puuid: string;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
}

const APEX_TIERS = ["MASTER", "GRANDMASTER", "CHALLENGER"];

// Riot returns tier "GOLD" + rank "II"; apex tiers come back with rank "I"
// but are stored without a division.
function toRank(entry: RankedEntry | undefined): Rank | null {
  if (!entry) return null;
  const value = APEX_TIERS.includes(entry.tier)
    ? entry.tier
    : `${entry.tier}_${entry.rank}`;
  return (rankEnum.enumValues as readonly string[]).includes(value)
    ? (value as Rank)
    : null;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { gameName, tagLine, region } = await request.json();

    if (!RIOT_API_KEY) {
      return NextResponse.json(
        { success: false, message: "Riot API key not configured" },
        { status: 500 },
      );
    }

    const regionalEndpoint =
      REGIONAL_ENDPOINTS[region as keyof typeof REGIONAL_ENDPOINTS];
    const platformEndpoint =
      REGION_ENDPOINTS[region as keyof typeof REGION_ENDPOINTS];

    if (!regionalEndpoint || !platformEndpoint) {
      return NextResponse.json(
        { success: false, message: "Invalid region" },
        { status: 400 },
      );
    }

    // Get account by riot ID (gameName#tagLine)
    const accountResponse = await fetch(
      `https://${regionalEndpoint}/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}?api_key=${RIOT_API_KEY}`,
    );

    if (!accountResponse.ok) {
      if (accountResponse.status === 404) {
        return NextResponse.json({
          success: false,
          message: "Account not found",
        });
      }
      throw new Error("Riot API request failed");
    }

    const account = await accountResponse.json();

    // Get summoner by PUUID
    const summonerResponse = await fetch(
      `https://${platformEndpoint}/lol/summoner/v4/summoners/by-puuid/${account.puuid}?api_key=${RIOT_API_KEY}`,
    );

    if (!summonerResponse.ok) {
      return NextResponse.json({
        success: false,
        message: "Summoner not found for this region",
      });
    }

    const summoner = await summonerResponse.json();

    // Get rank information using PUUID
    const rankedResponse = await fetch(
      `https://${platformEndpoint}/lol/league/v4/entries/by-puuid/${account.puuid}?api_key=${RIOT_API_KEY}`,
    );

    let soloRank: Rank | null = null;
    let flexRank: Rank | null = null;

    if (rankedResponse.ok) {
      const rankedData: RankedEntry[] = await rankedResponse.json();

      soloRank = toRank(
        rankedData.find((entry) => entry.queueType === "RANKED_SOLO_5x5"),
      );
      flexRank = toRank(
        rankedData.find((entry) => entry.queueType === "RANKED_FLEX_SR"),
      );
    }

    await db
      .update(users)
      .set({
        summonerName: `${account.gameName}#${account.tagLine}`,
        soloRank,
        flexRank,
        updatedAt: new Date(),
      })
      .where(eq(users.email, session.user.email));

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Riot API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to verify summoner" },
      { status: 500 },
    );
  }
}
