import Image from "next/image";
import type { CSSProperties } from "react";
import { parseRank } from "@/lib/rank";

const SIZES = {
  sm: { box: "size-5", icon: 14 },
  md: { box: "size-7", icon: 20 },
  lg: { box: "size-10", icon: 28 },
} as const;

export function RankBadge({
  rank,
  size = "md",
  className = "-right-1.5 -bottom-1.5",
}: {
  rank: string | null | undefined;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const parsed = parseRank(rank);
  if (!parsed?.icon) return null;
  const { box, icon } = SIZES[size];
  const src = parsed.icon.replace("/ranks/", "/ranks/badge/");

  return (
    <span
      title={parsed.label}
      style={{ "--tier": parsed.color } as CSSProperties}
      className={`absolute flex ${box} items-center justify-center rounded-full border border-[color-mix(in_oklab,var(--tier)_65%,transparent)] bg-background shadow-[0_0_10px_color-mix(in_oklab,var(--tier)_45%,transparent)] ${className}`}
    >
      <Image src={src} alt={parsed.label} width={icon} height={icon} className="object-contain" />
    </span>
  );
}
