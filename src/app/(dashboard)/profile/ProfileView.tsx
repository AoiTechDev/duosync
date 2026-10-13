import Image from "next/image";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { Check, Pencil } from "lucide-react";
import type { User } from "@/db/schema";
import { ROLES, GOALS, PLAYSTYLE_TAGS, COMMUNICATION_PREFERENCES } from "@/data/preferences";
import { findRegion } from "@/data/regions";
import { parseRank } from "@/lib/rank";
import { getUserAvatarUrl, getUserInitials } from "@/auth";
import { RiotLinkCard } from "./RiotLinkCard";

const nameOf = (list: { id: string; name: string }[], id: string) => list.find((x) => x.id === id)?.name ?? id;
const role = (id?: string | null) => ROLES.find((r) => r.id === id);

function Chip({ children, highlight }: { children: ReactNode; highlight?: boolean }) {
  return (
    <span
      className={`inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-semibold ${
        highlight
          ? "border-primary bg-primary/[0.08] text-primary shadow-[0_0_12px_color-mix(in_oklab,var(--primary)_22%,transparent)]"
          : "border-border bg-popover/60 text-foreground/90"
      }`}
    >
      {children}
    </span>
  );
}

function PrefGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2.5">
      <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</h3>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function RankHalf({ queue, rank }: { queue: string; rank: string | null }) {
  const parsed = parseRank(rank);
  return (
    <div
      className="relative flex items-center gap-4 overflow-hidden p-5 sm:p-6"
      style={{ "--tier": parsed?.color ?? "var(--muted-fg)" } as CSSProperties}
    >
      <div className="pointer-events-none absolute inset-y-0 left-0 w-2/3 bg-[radial-gradient(circle_at_20%_50%,color-mix(in_oklab,var(--tier)_18%,transparent),transparent_70%)]" />
      <div className="relative size-20 shrink-0">
        {parsed?.icon ? (
          <>
            <div className="absolute inset-2 rounded-full bg-(--tier) opacity-40 blur-xl" />
            <Image src={parsed.icon} alt="" fill sizes="80px" className="object-contain" />
          </>
        ) : (
          <div className="size-full rounded-full border-2 border-dashed border-border" />
        )}
      </div>
      <div className="relative min-w-0">
        <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{queue}</div>
        <div className="mt-1 font-display text-[clamp(22px,2.6vw,30px)] font-black uppercase leading-none tracking-[-0.03em]">
          {parsed?.label ?? "Unranked"}
        </div>
      </div>
    </div>
  );
}

export function ProfileView({ user }: { user: User }) {
  const solo = parseRank(user.soloRank);
  const region = findRegion(user.region);
  const [riotName, riotTag] = (user.summonerName ?? "").split("#");
  const avatar = getUserAvatarUrl(user);
  const goals = user.goals ?? [];
  const playstyle = user.playstyle ?? [];
  const communication = user.communication ?? [];

  return (
    <div style={{ "--tier": solo?.color ?? "var(--primary)" } as CSSProperties}>
      {/* Hero banner */}
      <section className="relative overflow-hidden border-b border-border bg-[linear-gradient(110deg,color-mix(in_oklab,var(--card)_80%,transparent),color-mix(in_oklab,var(--glow)_22%,var(--card))_70%,color-mix(in_oklab,var(--tier)_18%,var(--card)))]">
        <div className="pointer-events-none absolute -top-1/2 left-[45%] h-[200%] w-24 rotate-[24deg] bg-foreground/[0.04]" />
        {solo?.icon && (
          <div className="pointer-events-none absolute top-1/2 right-[6%] size-56 -translate-y-1/2 opacity-[0.12] blur-[1px] sm:size-72">
            <Image src={solo.icon} alt="" fill sizes="288px" className="object-contain" />
          </div>
        )}
        <div className="relative mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-5 py-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <div className="rounded-full bg-linear-to-br from-electric to-glow p-[3px] shadow-[0_0_28px_color-mix(in_oklab,var(--electric)_45%,transparent)]">
                {avatar ? (
                  <Image src={avatar} alt="" width={88} height={88} className="size-[88px] rounded-full object-cover" />
                ) : (
                  <div className="flex size-[88px] items-center justify-center rounded-full bg-linear-to-br from-primary to-accent text-2xl font-black text-primary-foreground">
                    {getUserInitials(user.name, user.username)}
                  </div>
                )}
              </div>
              {solo?.icon && (
                <div className="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full border border-border bg-card">
                  <Image src={solo.icon} alt="" width={22} height={22} />
                </div>
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-electric shadow-[0_0_8px_var(--electric)]" /> Player card
              </div>
              <h1 className="mt-1 truncate font-display text-[clamp(36px,6vw,72px)] font-black uppercase leading-[0.95] tracking-[-0.03em]">
                {user.username}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                {riotName && (
                  <span className="font-mono font-semibold">
                    {riotName}
                    {riotTag && <span className="text-electric">#{riotTag}</span>}
                  </span>
                )}
                {riotName && region && <span className="text-muted-foreground">·</span>}
                {region && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/70 px-2.5 py-1 text-xs font-semibold">
                    <span className="font-mono text-[10px] font-bold text-electric">{region.code}</span>
                    {region.label}
                  </span>
                )}
              </div>
            </div>
          </div>
          <Link
            href="/profile/edit"
            className="inline-flex h-10 shrink-0 items-center gap-2 self-start rounded-[10px] border border-electric px-4 text-sm font-semibold text-electric transition-[background-color,box-shadow] hover:bg-electric/5 hover:shadow-[0_0_18px_color-mix(in_oklab,var(--electric)_40%,transparent)] sm:self-auto"
          >
            <Pencil className="size-4" /> Edit profile
          </Link>
        </div>
      </section>

      <div className="mx-auto grid w-full max-w-[1120px] gap-6 px-5 py-8 lg:grid-cols-[1fr_320px]">
        <div className="min-w-0 space-y-6">
          <section className="grid overflow-hidden rounded-2xl border border-border bg-card/80 sm:grid-cols-2 sm:divide-x sm:divide-border">
            <RankHalf queue="Solo / Duo" rank={user.soloRank} />
            <RankHalf queue="Flex" rank={user.flexRank} />
          </section>

          {user.bio && (
            <figure className="flex gap-3 px-1">
              <span aria-hidden className="font-display text-6xl leading-[0.8] font-black text-primary">
                &ldquo;
              </span>
              <div>
                <blockquote className="text-[18px] leading-relaxed font-medium sm:text-xl">{user.bio}</blockquote>
                <figcaption className="mt-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Bio
                </figcaption>
              </div>
            </figure>
          )}

          <section className="space-y-6 rounded-2xl border border-border bg-card/80 p-5 sm:p-6">
            <h2 className="font-display text-[18px] font-black uppercase tracking-[-0.02em]">Preferences</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              <PrefGroup label="Roles">
                {role(user.mainRole) && (
                  <Chip highlight>
                    <Image src={role(user.mainRole)!.icon} alt="" width={14} height={14} />
                    {role(user.mainRole)!.name.replace(" Lane", "")} · main
                  </Chip>
                )}
                {role(user.secondaryRole) && (
                  <Chip>
                    <Image src={role(user.secondaryRole)!.icon} alt="" width={14} height={14} />
                    {role(user.secondaryRole)!.name.replace(" Lane", "")} · second
                  </Chip>
                )}
                {!user.mainRole && !user.secondaryRole && <span className="text-sm text-muted-foreground">Not set</span>}
              </PrefGroup>
              <PrefGroup label="Goals">
                {goals.length ? goals.map((g) => <Chip key={g}>{nameOf(GOALS, g)}</Chip>) : <span className="text-sm text-muted-foreground">Not set</span>}
              </PrefGroup>
              <PrefGroup label="Playstyle">
                {playstyle.length ? (
                  playstyle.map((p) => <Chip key={p}>{nameOf(PLAYSTYLE_TAGS, p)}</Chip>)
                ) : (
                  <span className="text-sm text-muted-foreground">Not set</span>
                )}
              </PrefGroup>
            </div>
            <PrefGroup label="Communication">
              {communication.length ? (
                communication.map((c) => <Chip key={c}>{nameOf(COMMUNICATION_PREFERENCES, c)}</Chip>)
              ) : (
                <span className="text-sm text-muted-foreground">Not set</span>
              )}
            </PrefGroup>
          </section>
        </div>

        <aside className="space-y-6">
          {user.summonerName ? (
            <section className="rounded-2xl border border-success/30 bg-card/80 p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-[18px] leading-tight font-black uppercase tracking-[-0.02em]">
                  Riot account
                </h2>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                  <Check className="size-3.5" strokeWidth={3} /> Connected
                </span>
              </div>
              <dl className="mt-4 space-y-2.5 text-sm">
                {[
                  [
                    "Riot ID",
                    <span key="id" className="font-mono">
                      {riotName}
                      {riotTag && <span className="text-electric">#{riotTag}</span>}
                    </span>,
                  ],
                  ["Summoner", riotName],
                  ["Solo", solo?.label ?? "Unranked"],
                  ["Flex", parseRank(user.flexRank)?.label ?? "Unranked"],
                ].map(([label, value]) => (
                  <div key={String(label)} className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">{label}</dt>
                    <dd className="truncate font-semibold">{value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : (
            <RiotLinkCard region={user.region} />
          )}
        </aside>
      </div>
    </div>
  );
}
