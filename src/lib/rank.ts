import { RANKS } from "@/data/preferences";

export const TIER_ORDER = [
  "IRON",
  "BRONZE",
  "SILVER",
  "GOLD",
  "PLATINUM",
  "EMERALD",
  "DIAMOND",
  "MASTER",
  "GRANDMASTER",
  "CHALLENGER",
] as const;

const ROMAN = new Set(["I", "II", "III", "IV"]);

const titleCase = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

export interface ParsedRank {
  tier: string;
  label: string;
  icon?: string;
  color: string;
  index: number;
}

export function parseRank(rank?: string | null): ParsedRank | null {
  if (!rank) return null;
  const [tier, division] = rank.split("_");
  const index = TIER_ORDER.indexOf(tier as (typeof TIER_ORDER)[number]);
  if (index === -1) return null;
  return {
    tier,
    label: division && ROMAN.has(division) ? `${titleCase(tier)} ${division}` : titleCase(tier),
    icon: RANKS.find((r) => r.id === tier)?.icon,
    color: `var(--${tier.toLowerCase()})`,
    index,
  };
}

export const tierLabel = (tier: string) => titleCase(tier);
