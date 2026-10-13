import Image from "next/image";
import type { CSSProperties } from "react";
import { RANKS } from "@/data/preferences";

const ROMAN = new Set(["I", "II", "III", "IV"]);

// "DIAMOND_II" -> { tier: "DIAMOND", label: "Diamond II" }; "MASTER" -> { tier: "MASTER", label: "Master" }
function parseRank(rank?: string | null) {
  if (!rank) return null;
  const [tier, division] = rank.split("_");
  const name = tier.charAt(0) + tier.slice(1).toLowerCase();
  return { tier, label: division && ROMAN.has(division) ? `${name} ${division}` : name };
}

export function RankReveal({
  queue,
  rank,
  delay = 0,
}: {
  queue: string;
  rank?: string | null;
  /** Seconds before this card starts animating, to stagger several reveals. */
  delay?: number;
}) {
  const parsed = parseRank(rank);
  const icon = parsed ? RANKS.find((r) => r.id === parsed.tier)?.icon : undefined;
  const tierVar = parsed ? `var(--${parsed.tier.toLowerCase()})` : "var(--muted-fg)";
  const at = (s: number): CSSProperties => ({ animationDelay: `${delay + s}s` });

  return (
    <div
      className="relative flex flex-col items-center overflow-hidden px-6 pt-10 pb-8"
      style={{ "--tier": tierVar } as CSSProperties}
    >
      {/* Ambient tier light behind the whole panel */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_38%,color-mix(in_oklab,var(--tier)_16%,transparent),transparent_65%)]" />

      <div className="relative size-[190px] sm:size-[210px]">
        {parsed && icon ? (
          <>
            {/* 1. Flash of light */}
            <div
              className="absolute inset-0 rounded-full bg-[radial-gradient(circle,var(--tier)_0%,transparent_65%)] opacity-0 motion-safe:animate-burst"
              style={at(0)}
            />
            {/* 2. Ring scales in with overshoot, then a light sweeps around it */}
            <div className="absolute inset-0 motion-safe:animate-ring-in" style={at(0.05)}>
              <div className="absolute inset-0 rounded-full border-2 border-(--tier) bg-[radial-gradient(circle,color-mix(in_oklab,var(--tier)_20%,transparent)_0%,transparent_70%)] shadow-[0_0_34px_color-mix(in_oklab,var(--tier)_65%,transparent),inset_0_0_34px_color-mix(in_oklab,var(--tier)_35%,transparent)]" />
              <div
                className="absolute -inset-1 rounded-full bg-[conic-gradient(from_0deg,transparent_0%,transparent_62%,var(--tier)_88%,transparent_100%)] mask-[radial-gradient(farthest-side,transparent_calc(100%-5px),black_calc(100%-4px))] motion-safe:animate-ring-sweep"
              />
            </div>
            {/* 3. Repeating pulse once the ring has landed */}
            <div
              className="absolute inset-0 rounded-full border border-(--tier) opacity-0 motion-safe:animate-ring-pulse"
              style={at(0.9)}
            />
            {/* 4. Emblem pops in */}
            <div className="absolute inset-[12%] motion-safe:animate-emblem-pop" style={at(0.25)}>
              <Image src={icon} alt="" fill sizes="180px" loading="eager" className="object-contain" />
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center rounded-full border-2 border-dashed border-border motion-safe:animate-ring-in">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              No rank
            </span>
          </div>
        )}
      </div>

      <div className="relative mt-5 text-center motion-safe:animate-rise" style={at(0.6)}>
        <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          {queue}
        </div>
        <div className="mt-1 font-display text-[clamp(26px,3.4vw,36px)] font-black uppercase leading-none tracking-[-0.03em]">
          {parsed ? parsed.label : "Unranked"}
        </div>
      </div>
    </div>
  );
}
