"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, UserRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptFriendRequest, declineFriendRequest } from "@/features/friends/api";
import { parseRank } from "@/lib/rank";

export type InboundRequest = {
  id: string;
  createdAt: string;
  status: string;
  otherUser: { id: string; username: string | null; image: string | null; soloRank: string | null };
};

export const INBOUND_KEY = ["friends", "requests", "inbound"];

export function useInboundRequests() {
  return useQuery({
    queryKey: INBOUND_KEY,
    queryFn: async () => {
      const res = await fetch(`/api/friends/request?direction=inbound&limit=10`, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to load requests");
      return res.json() as Promise<{ items: InboundRequest[] }>;
    },
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}

function Avatar({ user }: { user: InboundRequest["otherUser"] }) {
  if (user.image) {
    return <Image src={user.image} alt="" width={36} height={36} className="size-9 rounded-full object-cover" />;
  }
  return (
    <div className="flex size-9 items-center justify-center rounded-full bg-linear-to-br from-primary to-accent text-xs font-black text-primary-foreground">
      {(user.username ?? "?").slice(0, 2).toUpperCase()}
    </div>
  );
}

export function FriendRequestsList({ compact }: { compact?: boolean }) {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useInboundRequests();
  const [accepted, setAccepted] = useState<InboundRequest[]>([]);

  const onSettled = () => {
    queryClient.invalidateQueries({ queryKey: INBOUND_KEY });
    queryClient.invalidateQueries({ queryKey: ["posts"] });
    queryClient.invalidateQueries({ queryKey: ["friends", "list"] });
  };
  const accept = useMutation({
    mutationFn: (r: InboundRequest) => acceptFriendRequest(r.id),
    onSuccess: (_res, r) => setAccepted((prev) => [...prev, r]),
    onSettled,
  });
  const decline = useMutation({ mutationFn: (r: InboundRequest) => declineFriendRequest(r.id), onSettled });

  const pending = data?.items ?? [];
  const rows = [
    ...pending.filter((r) => !accepted.some((a) => a.id === r.id)).map((r) => ({ r, done: false })),
    ...accepted.map((r) => ({ r, done: true })),
  ].sort((a, b) => b.r.createdAt.localeCompare(a.r.createdAt));
  const busy = (id: string) =>
    (accept.isPending && accept.variables?.id === id) || (decline.isPending && decline.variables?.id === id);
  const error = (accept.error ?? decline.error)?.message;

  if (isLoading) {
    return (
      <div className="flex justify-center py-10 text-muted-foreground">
        <Loader2 className="size-5 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="px-4 py-8 text-center text-sm text-muted-foreground">
        Couldn&apos;t load requests.{" "}
        <button className="cursor-pointer font-semibold text-electric hover:underline" onClick={() => refetch()}>
          Retry
        </button>
      </p>
    );
  }

  if (rows.length === 0) {
    return (
      <div className={`flex flex-col items-center text-center ${compact ? "px-3 py-6" : "px-6 py-10"}`}>
        <div className="flex size-11 items-center justify-center rounded-full border border-border bg-card">
          <UserRound className="size-5 text-muted-foreground" />
        </div>
        <p className="mt-3 max-w-[220px] text-sm text-muted-foreground">
          No pending requests. Post a duo request to get some.
        </p>
      </div>
    );
  }

  return (
    <>
      <ul className="divide-y divide-border">
        {rows.map(({ r, done }) => {
          const rank = parseRank(r.otherUser.soloRank);
          return (
            <li key={r.id} className={`flex items-center gap-3 ${compact ? "px-3 py-2.5" : "px-4 py-3"}`}>
              {!compact && <Avatar user={r.otherUser} />}
              {compact && rank?.badge && <Image src={rank.badge} alt="" width={20} height={20} />}
              <div className="min-w-0 flex-1">
                {r.otherUser.username ? (
                  <Link
                    href={`/players/${encodeURIComponent(r.otherUser.username)}`}
                    className="block truncate text-sm font-semibold hover:text-primary hover:underline"
                  >
                    {r.otherUser.username}
                  </Link>
                ) : (
                  <div className="truncate text-sm font-semibold">Unknown</div>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {!compact && rank?.badge && <Image src={rank.badge} alt="" width={14} height={14} />}
                  {rank?.label ?? "Unranked"}
                </div>
              </div>
              {done ? (
                <span className="inline-flex h-7 items-center gap-1 rounded-full border border-success/35 bg-success/10 px-2.5 text-xs font-semibold text-success motion-safe:animate-rise">
                  <Check className="size-3.5" strokeWidth={3} /> Friends
                </span>
              ) : (
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    className="size-8"
                    aria-label={`Accept ${r.otherUser.username ?? "request"}`}
                    disabled={busy(r.id)}
                    onClick={() => accept.mutate(r)}
                  >
                    {accept.isPending && accept.variables?.id === r.id ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Check strokeWidth={3} />
                    )}
                  </Button>
                  <button
                    type="button"
                    aria-label={`Decline ${r.otherUser.username ?? "request"}`}
                    disabled={busy(r.id)}
                    onClick={() => decline.mutate(r)}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
                  >
                    {decline.isPending && decline.variables?.id === r.id ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <X className="size-4" />
                    )}
                  </button>
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {error && <p className="px-4 pb-3 text-xs text-destructive">{error}</p>}
    </>
  );
}
