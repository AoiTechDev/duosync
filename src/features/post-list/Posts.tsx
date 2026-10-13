"use client";
import { useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Loader2, Search } from "lucide-react";
import type { FeedPost, User } from "@/lib/db";
import { ROLES } from "@/data/preferences";
import { REGION_OPTIONS } from "@/data/regions";
import { GAME_MODES } from "@/data/game-modes";
import { isExpired } from "@/lib/post-lifecycle";
import { useNow } from "@/hooks/use-now";
import { parseRank, TIER_ORDER, tierLabel } from "@/lib/rank";
import { useFormStore } from "@/store/create-post-store";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CreatePost from "@/features/create-post/CreatePost";
import PostSkeleton from "@/components/PostSkeleton";
import { VirtualPostList } from "./components/VirtualPostList";
import { EditPostDialog } from "./components/EditPostDialog";

const LANES = ROLES.filter((r) => r.id !== "FILL");
const RANK_FILTERS = ["GOLD", "PLATINUM", "EMERALD", "DIAMOND", "MASTER"] as const;

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-xs font-semibold transition-colors ${
        active
          ? "border-primary bg-primary/[0.08] text-primary shadow-[0_0_12px_color-mix(in_oklab,var(--primary)_25%,transparent)]"
          : "border-border bg-card/70 text-foreground/85 hover:border-input hover:bg-popover"
      }`}
    >
      {children}
    </button>
  );
}

function FilterLabel({ children }: { children: ReactNode }) {
  return (
    <span className="shrink-0 font-mono sm:w-14 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </span>
  );
}

function StateCard({
  tone = "neutral",
  icon,
  title,
  text,
  children,
}: {
  tone?: "neutral" | "error";
  icon: ReactNode;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`flex flex-col items-center rounded-2xl border px-6 py-12 text-center ${
        tone === "error" ? "border-destructive/35 bg-destructive/[0.04]" : "border-border bg-card/70"
      }`}
    >
      <div
        className={`flex size-11 items-center justify-center rounded-full ${
          tone === "error" ? "bg-destructive/15 text-destructive" : "bg-popover text-primary"
        }`}
      >
        {icon}
      </div>
      <h3 className="mt-4 font-display text-[18px] font-black uppercase tracking-[-0.02em]">{title}</h3>
      <p className="mt-1 max-w-xs text-sm text-muted-foreground">{text}</p>
      {children && <div className="mt-5 flex gap-2">{children}</div>}
    </div>
  );
}

const Posts = ({ user }: { user: User }) => {
  const [gameMode, setGameMode] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [minTier, setMinTier] = useState<string | null>(null);
  const [region, setRegion] = useState<string>("ALL");
  const { setShouldOpenCreateDialog } = useFormStore();

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ["posts"],
    queryFn: async (): Promise<{ posts: FeedPost[] }> => {
      const response = await fetch("/api/posts");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    },
    retry: (failureCount, error) => !error.message.startsWith("HTTP 4") && failureCount < 2,
    staleTime: 60 * 1000,
    refetchInterval: 60 * 1000,
  });
  const now = useNow();

  const filtered = useMemo(() => {
    const minIndex = minTier ? TIER_ORDER.indexOf(minTier as (typeof TIER_ORDER)[number]) : -1;
    return (data?.posts ?? []).filter(
      (p) =>
        (p.relation === "self" || !isExpired(p.expiresAt, now)) &&
        (!gameMode || p.gameMode === gameMode) &&
        (!role || p.role === role) &&
        (region === "ALL" || p.region === region) &&
        (minIndex < 0 || (parseRank(p.author.soloRank)?.index ?? -1) >= minIndex),
    );
  }, [data, now, gameMode, role, minTier, region]);

  const hasFilters = !!gameMode || !!role || !!minTier || region !== "ALL";
  const clearFilters = () => {
    setGameMode(null);
    setRole(null);
    setMinTier(null);
    setRegion("ALL");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4 rounded-2xl border border-border bg-card/60 p-4 backdrop-blur-sm sm:space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <FilterLabel>Queue</FilterLabel>
          <div className="flex flex-wrap gap-2">
            <FilterChip active={!gameMode} onClick={() => setGameMode(null)}>
              All
            </FilterChip>
            {GAME_MODES.map((m) => (
              <FilterChip
                key={m.id}
                active={gameMode === m.id}
                onClick={() => setGameMode(gameMode === m.id ? null : m.id)}
              >
                {m.label}
              </FilterChip>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <FilterLabel>Role</FilterLabel>
          <div className="flex flex-wrap gap-2">
            <FilterChip active={!role} onClick={() => setRole(null)}>
              All
            </FilterChip>
            {LANES.map((r) => (
              <FilterChip key={r.id} active={role === r.id} onClick={() => setRole(role === r.id ? null : r.id)}>
                <Image src={r.icon} alt="" width={14} height={14} />
                {r.name.replace(" Lane", "")}
              </FilterChip>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-4 sm:gap-3 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <FilterLabel>Rank</FilterLabel>
            <div className="flex flex-wrap gap-2">
              {RANK_FILTERS.map((tier) => {
                const parsed = parseRank(tier);
                return (
                  <FilterChip
                    key={tier}
                    active={minTier === tier}
                    onClick={() => setMinTier(minTier === tier ? null : tier)}
                  >
                    {parsed?.icon && <Image src={parsed.icon} alt="" width={16} height={16} />}
                    {tierLabel(tier)}+
                  </FilterChip>
                );
              })}
            </div>
          </div>
          <div className="hidden h-6 w-px bg-border lg:block" />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <FilterLabel>Region</FilterLabel>
            <Select value={region} onValueChange={setRegion}>
              <SelectTrigger
                size="sm"
                className={`h-8 w-full rounded-full px-3 text-xs font-semibold sm:w-auto ${
                  region !== "ALL" ? "border-primary text-primary" : "border-border"
                }`}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All regions</SelectItem>
                {REGION_OPTIONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    <span className="font-mono text-[10px] font-bold text-electric">{r.code}</span>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <CreatePost user={user} />

      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <span>
          {isLoading ? "Loading requests" : `${filtered.length} duo request${filtered.length === 1 ? "" : "s"}`}{" "}
          · latest first
        </span>
        {isFetching && !isLoading && <Loader2 className="size-3.5 animate-spin" />}
      </div>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <StateCard
          tone="error"
          icon={<AlertCircle className="size-5" />}
          title="Feed didn't load"
          text="Check your connection and try again."
        >
          <Button variant="ghost" size="sm" onClick={() => refetch()} disabled={isFetching}>
            {isFetching && <Loader2 className="animate-spin" />} Retry
          </Button>
        </StateCard>
      ) : filtered.length === 0 ? (
        <StateCard
          icon={<Search className="size-5" />}
          title="No duos match"
          text={
            hasFilters
              ? "Widen your filters or be the first to post for this queue."
              : "Nobody is looking right now. Be the first to post."
          }
        >
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
          <Button size="sm" onClick={() => setShouldOpenCreateDialog(true)}>
            Post a duo request
          </Button>
        </StateCard>
      ) : (
        <VirtualPostList posts={filtered} now={now} />
      )}

      <EditPostDialog />
    </div>
  );
};

export default Posts;
