import { RANKS } from "@/data/preferences";

/** Tiers from lowest to highest. */
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
  /** "Diamond II", "Master" */
  label: string;
  /** /ranks/... emblem path */
  icon?: string;
  /** CSS color for the tier, e.g. "var(--diamond)" */
  color: string;
  /** 0 (Iron) … 9 (Challenger) */
  index: number;
}

/** Parses "DIAMOND_II", "MASTER" or a bare tier like "GOLD". */
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
