import Image from "next/image";

// Positions are % of the field (center of each item), sizes in px.
const RANKS = [
  { src: "/ranks/CHALLANGER.png", tier: "challenger", size: 220, left: 53, top: 15, delay: 0 },
  { src: "/ranks/GRANDMASTER.png", tier: "grandmaster", size: 120, left: 93, top: 14, delay: 1.2 },
  { src: "/ranks/MASTER.png", tier: "master", size: 140, left: 17, top: 30, delay: 2.4 },
  { src: "/ranks/DIAMOND.png", tier: "diamond", size: 160, left: 72, top: 40, delay: 0.6 },
  { src: "/ranks/EMERALD.png", tier: "emerald", size: 120, left: 34, top: 57, delay: 3.1 },
  { src: "/ranks/PLATINUM.png", tier: "platinum", size: 130, left: 83, top: 67, delay: 1.8 },
  { src: "/ranks/GOLD.png", tier: "gold", size: 100, left: 10, top: 73, delay: 4 },
  { src: "/ranks/SILVER.png", tier: "silver", size: 90, left: 52, top: 82, delay: 2.9 },
  { src: "/ranks/BRONZE.png", tier: "bronze", size: 80, left: 94, top: 88, delay: 0.3 },
  { src: "/ranks/IRON.png", tier: "iron", size: 70, left: 23, top: 93, delay: 3.6 },
] as const;

const LANES = [
  { src: "/lane-icons/top-icon.png", alt: "Top", left: 7, top: 11, delay: 1.5 },
  { src: "/lane-icons/jungle-icon.png", alt: "Jungle", left: 35, top: 34, delay: 0.9 },
  { src: "/lane-icons/adc-icon.png", alt: "ADC", left: 82, top: 47, delay: 2.2 },
  { src: "/lane-icons/mid-icon.png", alt: "Mid", left: 56, top: 63, delay: 3.4 },
  { src: "/lane-icons/supp-icon.png", alt: "Support", left: 69, top: 93, delay: 0.2 },
] as const;

export default function EmblemField() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 hidden w-[55%] lg:block">
      {RANKS.map((r) => (
        <div
          key={r.src}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${r.left}%`, top: `${r.top}%`, width: r.size, height: r.size }}
        >
          <div
            className="motion-safe:animate-float relative size-full"
            style={{ animationDelay: `-${r.delay}s` }}
          >
            <div
              className="absolute inset-[12%] rounded-full opacity-55 blur-3xl"
              style={{ background: `var(--${r.tier})` }}
            />
            <Image
              src={r.src}
              alt=""
              fill
              loading="eager"
              sizes={`${r.size}px`}
              className="object-contain"
            />
          </div>
        </div>
      ))}

      {LANES.map((l) => (
        <div
          key={l.src}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${l.left}%`, top: `${l.top}%` }}
        >
          <div
            className="motion-safe:animate-float flex size-11 items-center justify-center rounded-lg border border-primary/25 bg-card/80 shadow-[0_0_18px_color-mix(in_oklab,var(--primary)_30%,transparent)] backdrop-blur-sm"
            style={{ animationDelay: `-${l.delay}s` }}
          >
            <Image src={l.src} alt={l.alt} width={26} height={26} loading="eager" />
          </div>
        </div>
      ))}
    </div>
  );
}
