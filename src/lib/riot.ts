const PLATFORM_HOSTS = {
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
} as const;

const REGIONAL_HOSTS = {
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
} as const;

export type RiotRegion = keyof typeof PLATFORM_HOSTS;

export type RiotAccount = { puuid: string; gameName: string; tagLine: string };
export type RiotSummoner = { puuid: string; summonerLevel: number; profileIconId: number };
export type RiotLeagueEntry = {
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
};

export class RiotError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function isRiotRegion(region: unknown): region is RiotRegion {
  return typeof region === "string" && region in PLATFORM_HOSTS;
}

async function riotFetch<T>(host: string, path: string): Promise<T> {
  const key = process.env.RIOT_API_KEY;
  if (!key) throw new RiotError(500, "Riot API key not configured");

  const res = await fetch(`https://${host}${path}`, {
    headers: { "X-Riot-Token": key },
    cache: "no-store",
  });

  if (res.ok) return res.json() as Promise<T>;
  if (res.status === 401 || res.status === 403) {
    throw new RiotError(502, "Riot API key is invalid or expired");
  }
  if (res.status === 404) throw new RiotError(404, "Not found");
  if (res.status === 429) throw new RiotError(429, "Too many requests to Riot, try again in a minute");
  throw new RiotError(502, `Riot API request failed: ${res.status}`);
}

export function getAccountByRiotId(region: RiotRegion, gameName: string, tagLine: string) {
  return riotFetch<RiotAccount>(
    REGIONAL_HOSTS[region],
    `/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
  );
}

export function getSummonerByPuuid(region: RiotRegion, puuid: string) {
  return riotFetch<RiotSummoner>(PLATFORM_HOSTS[region], `/lol/summoner/v4/summoners/by-puuid/${puuid}`);
}

export function getLeagueEntriesByPuuid(region: RiotRegion, puuid: string) {
  return riotFetch<RiotLeagueEntry[]>(PLATFORM_HOSTS[region], `/lol/league/v4/entries/by-puuid/${puuid}`);
}
