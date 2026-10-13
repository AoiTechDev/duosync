"use client";
import { useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Loader2, Lock, UserMinus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FriendRequestsList, useInboundRequests } from "@/components/friends/FriendRequestsList";
import { RequestCount } from "@/components/FriendsDropdown";
import { cancelFriendRequest, removeFriend } from "@/features/friends/api";
import { ROLES } from "@/data/preferences";
import { findRegion } from "@/data/regions";
import { parseRank } from "@/lib/rank";

type Friend = {
  id: string;
  username: string;
  image: string | null;
  avatar: string | null;
  summonerName: string | null;
  region: string | null;
  soloRank: string | null;
  flexRank: string | null;
  mainRole: string | null;
  since: string;
};

type OutboundRequest = {
  id: string;
  createdAt: string;
  otherUser: { id: string; username: string | null; image: string | null; soloRank: string | null };
};

export const FRIENDS_KEY = ["friends", "list"];
const OUTBOUND_KEY = ["friends", "requests", "outbound"];

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

function Avatar({ name, src, rank, size = 48 }: { name: string; src?: string | null; rank?: string | null; size?: number }) {
  const parsed = parseRank(rank);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {src ? (
        <Image src={src} alt="" width={size} height={size} className="size-full rounded-full object-cover" />
      ) : (
        <div className="flex size-full items-center justify-center rounded-full bg-linear-to-br from-primary to-accent text-sm font-black text-primary-foreground">
          {name.slice(0, 2).toUpperCase()}
        </div>
      )}
      {parsed?.icon && (
        <span className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border border-border bg-card">
          <Image src={parsed.icon} alt="" width={14} height={14} />
        </span>
      )}
    </div>
  );
}

function Panel({ title, count, children }: { title: string; count?: number; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card/80">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <h2 className="font-display text-sm font-black uppercase">{title}</h2>
        {count !== undefined && <RequestCount count={count} />}
      </div>
      {children}
    </section>
  );
}

function RiotIdCopy({ summonerName }: { summonerName: string | null }) {
  const [copied, setCopied] = useState(false);
  if (!summonerName) {
    return <span className="text-sm text-muted-foreground">Riot ID not linked</span>;
  }
  const [name, tag] = summonerName.split("#");
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(summonerName);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      title="Copy Riot ID"
      className="group inline-flex max-w-full cursor-pointer items-center gap-2 rounded-lg border border-border bg-popover/60 px-2.5 py-1.5 font-mono text-sm transition-colors hover:border-electric/50"
    >
      <span className="truncate">
        {name}
        {tag && <span className="text-electric">#{tag}</span>}
      </span>
      {copied ? (
        <Check className="size-3.5 shrink-0 text-success" />
      ) : (
        <Copy className="size-3.5 shrink-0 text-muted-foreground group-hover:text-electric" />
      )}
    </button>
  );
}

function FriendCard({ friend }: { friend: Friend }) {
  const queryClient = useQueryClient();
  const [confirm, setConfirm] = useState(false);
  const rank = parseRank(friend.soloRank);
  const role = ROLES.find((r) => r.id === friend.mainRole);
  const region = findRegion(friend.region);

  const remove = useMutation({
    mutationFn: () => removeFriend(friend.id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: FRIENDS_KEY });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  return (
    <article
      style={{ "--tier": rank?.color ?? "var(--muted-fg)" } as CSSProperties}
      className="relative overflow-hidden rounded-2xl border border-border bg-card/90 p-5 motion-safe:animate-rise"
    >
      <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-(--tier) to-transparent opacity-80" />
      <div className="pointer-events-none absolute -top-24 -right-16 size-56 rounded-full bg-(--tier) opacity-[0.14] blur-3xl" />

      <div className="relative flex items-start gap-3">
        <Avatar name={friend.username} src={friend.image || friend.avatar} rank={friend.soloRank} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold">
            <Link href={`/players/${encodeURIComponent(friend.username)}`} className="hover:text-primary hover:underline">
              {friend.username}
            </Link>
          </h3>
          <div className="mt-1.5">
            <RiotIdCopy summonerName={friend.summonerName} />
          </div>
        </div>
        {rank?.icon && (
          <div className="relative hidden size-12 shrink-0 sm:block">
            <div className="absolute inset-1 rounded-full bg-(--tier) opacity-40 blur-lg" />
            <Image src={rank.icon} alt="" fill sizes="48px" className="object-contain" />
          </div>
        )}
      </div>

      <div className="relative mt-4 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="inline-flex h-7 items-center rounded-md border border-border bg-popover/60 px-2">
          {rank?.label ?? "Unranked"}
        </span>
        {role && (
          <span className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-popover/60 px-2">
            <Image src={role.icon} alt="" width={13} height={13} />
            {role.name.replace(" Lane", "")} main
          </span>
        )}
        {region && (
          <span className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-popover/60 px-2">
            <span className="font-mono text-[10px] font-bold text-electric">{region.code}</span>
            {region.label}
          </span>
        )}
      </div>

      <div className="relative mt-4 flex items-center justify-between gap-2 border-t border-border pt-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
          Friends since{" "}
          {new Date(friend.since).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}
        </span>
        <Button
          size="sm"
          variant={confirm ? "destructive" : "ghost"}
          disabled={remove.isPending}
          onClick={() => (confirm ? remove.mutate() : setConfirm(true))}
          onBlur={() => setConfirm(false)}
        >
          {remove.isPending ? <Loader2 className="animate-spin" /> : <UserMinus />}
          {confirm ? "Confirm remove" : "Remove"}
        </Button>
      </div>
      {remove.error && <p className="relative mt-2 text-xs text-destructive">{remove.error.message}</p>}
    </article>
  );
}

function SentRequests() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: OUTBOUND_KEY,
    queryFn: () => getJson<{ items: OutboundRequest[] }>("/api/friends/request?direction=outbound&limit=20"),
  });
  const cancel = useMutation({
    mutationFn: (id: string) => cancelFriendRequest(id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: OUTBOUND_KEY });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
  const items = data?.items ?? [];

  if (isLoading) {
    return (
      <div className="flex justify-center py-8 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }
  if (items.length === 0) {
    return <p className="px-4 py-6 text-center text-sm text-muted-foreground">No requests waiting on others.</p>;
  }
  return (
    <ul className="divide-y divide-border">
      {items.map((r) => {
        const name = r.otherUser.username ?? "Unknown";
        return (
          <li key={r.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar name={name} src={r.otherUser.image} rank={r.otherUser.soloRank} size={36} />
            <div className="min-w-0 flex-1">
              <Link
                href={`/players/${encodeURIComponent(name)}`}
                className="block truncate text-sm font-semibold hover:text-primary hover:underline"
              >
                {name}
              </Link>
              <div className="text-xs text-muted-foreground">Waiting for them to accept</div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              disabled={cancel.isPending && cancel.variables === r.id}
              onClick={() => cancel.mutate(r.id)}
            >
              {cancel.isPending && cancel.variables === r.id && <Loader2 className="animate-spin" />}
              Cancel
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

export function FriendsView() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: FRIENDS_KEY,
    queryFn: () => getJson<{ items: Friend[] }>("/api/friends"),
  });
  const inbound = useInboundRequests();
  const friends = data?.items ?? [];

  return (
    <div className="mx-auto w-full max-w-[1120px] px-5 pt-10 pb-20">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Your squad</div>
          <h1 className="mt-2 font-display text-[clamp(44px,7vw,84px)] font-black uppercase leading-[0.9] tracking-[-0.03em]">
            Friends{" "}
            {!isLoading && <span className="text-primary">{friends.length}</span>}
          </h1>
        </div>
        <p className="flex max-w-xs items-start gap-2 text-sm text-muted-foreground">
          <Lock className="mt-0.5 size-4 shrink-0 text-electric" />
          Riot IDs stay private. Only you and your accepted friends can see them.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          {isLoading ? (
            <div className="flex justify-center py-16 text-muted-foreground">
              <Loader2 className="size-6 animate-spin" />
            </div>
          ) : isError ? (
            <div className="rounded-2xl border border-destructive/35 bg-destructive/[0.04] px-6 py-12 text-center">
              <p className="text-sm text-muted-foreground">Couldn&apos;t load your friends.</p>
              <Button className="mt-4" size="sm" variant="ghost" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          ) : friends.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-border bg-card/70 px-6 py-14 text-center">
              <div className="flex size-11 items-center justify-center rounded-full bg-popover text-primary">
                <Users className="size-5" />
              </div>
              <h3 className="mt-4 font-display text-[18px] font-black uppercase">No friends yet</h3>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Send a request from a post in the feed. Once they accept, you&apos;ll see each other&apos;s Riot ID here.
              </p>
              <Button asChild size="sm" className="mt-5">
                <Link href="/posts">Browse the feed</Link>
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {friends.map((f) => (
                <FriendCard key={f.id} friend={f} />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <Panel title="Requests" count={inbound.data?.items.length ?? 0}>
            <FriendRequestsList />
          </Panel>
          <Panel title="Sent">
            <SentRequests />
          </Panel>
        </aside>
      </div>
    </div>
  );
}
