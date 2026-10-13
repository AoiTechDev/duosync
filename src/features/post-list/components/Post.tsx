"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { RankBadge } from "@/components/RankBadge";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowUp, Check, Clock, Hourglass, Loader2, Pencil, Trash2, UserPlus } from "lucide-react";
import type { FeedPost } from "@/lib/db";
import { ROLES } from "@/data/preferences";
import { findRegion } from "@/data/regions";
import { findGameMode } from "@/data/game-modes";
import { parseRank, tierLabel } from "@/lib/rank";
import { formatRelativeTime } from "@/lib/utils";
import { useFormStore } from "@/store/create-post-store";
import { Button } from "@/components/ui/button";
import { acceptFriendRequest, sendFriendRequest } from "@/features/friends/api";
import { bumpPost, deletePost } from "@/app/(dashboard)/feed/actions";
import { OnlineDot } from "@/components/presence/OnlineDot";
import { ClampedText } from "./ClampedText";
import { bumpAvailableAt, formatDuration, isExpired } from "@/lib/post-lifecycle";

const AVATAR_GRADIENTS = [
  "from-primary to-accent",
  "from-electric to-glow",
  "from-glow to-[#ff5fa2]",
  "from-success to-electric",
  "from-accent to-destructive",
];

function gradientFor(name: string) {
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) | 0;
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
}

const roleOf = (id?: string | null) => ROLES.find((r) => r.id === id);
const shortRole = (id?: string | null) => roleOf(id)?.name.replace(" Lane", "") ?? id ?? "";

function LookingForChip({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="flex min-w-0 items-center gap-2.5 rounded-xl border border-border bg-popover/50 p-2.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-card">{icon}</div>
      <div className="min-w-0">
        <div className="text-[11px] text-muted-foreground">{label}</div>
        <div className="line-clamp-2 text-sm leading-snug font-semibold" title={value}>
          {value}
        </div>
      </div>
    </div>
  );
}

const Post = ({ post, now }: { post: FeedPost; now: number }) => {
  const queryClient = useQueryClient();
  const { setPostId, setShouldOpenEditDialog } = useFormStore();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const author = post.author;
  const rank = parseRank(author.soloRank);
  const minRank = parseRank(post.rank);
  const region = findRegion(post.region);
  const mode = findGameMode(post.gameMode);
  const expired = isExpired(post.expiresAt, now);
  const timeLeft = new Date(post.expiresAt).getTime() - now;
  const bumpWait = bumpAvailableAt(post.bumpedAt) - now;
  const wasBumped = new Date(post.bumpedAt).getTime() - new Date(post.createdAt).getTime() > 60_000;
  const [riotName, riotTag] = (author.summonerName ?? "").split("#");
  const name = author.username || "Player";

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["posts"] });

  const sendRequest = useMutation({
    mutationFn: () => sendFriendRequest(author.id),
    onSettled: () => {
      refresh();
      queryClient.invalidateQueries({ queryKey: ["friends", "requests", "outbound"] });
    },
  });
  const acceptRequest = useMutation({
    mutationFn: () => acceptFriendRequest(post.requestId!),
    onSettled: () => {
      refresh();
      queryClient.invalidateQueries({ queryKey: ["friends", "requests", "inbound"] });
      queryClient.invalidateQueries({ queryKey: ["friends", "list"] });
    },
  });
  const bump = useMutation({
    mutationFn: async () => {
      const result = await bumpPost(post.id);
      if (!result.success) throw new Error(result.error);
    },
    onSettled: refresh,
  });
  const removePost = useMutation({
    mutationFn: async () => {
      const result = await deletePost(post.id);
      if (!result.success) throw new Error(result.error);
    },
    onSettled: refresh,
  });

  const tierStyle = { "--tier": rank?.color ?? "var(--muted-fg)" } as CSSProperties;

  return (
    <article
      style={tierStyle}
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card/90 ${expired ? "opacity-60 hover:opacity-100" : ""} shadow-[0_22px_50px_-28px_color-mix(in_oklab,var(--tier)_70%,transparent)] transition-[border-color,opacity] duration-200 hover:border-[color-mix(in_oklab,var(--tier)_40%,var(--border))]`}
    >
      <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-(--tier) to-transparent opacity-80" />
      {!expired && (
        <div className="pointer-events-none absolute -top-28 -right-20 size-72 rounded-full bg-(--tier) opacity-[0.16] blur-3xl" />
      )}

      <div className="relative flex flex-1 flex-col p-5">
        <header className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <Link
              href={`/players/${encodeURIComponent(author.username)}`}
              aria-label={`${name}'s profile`}
              className="relative shrink-0"
            >
              {author.image || author.avatar ? (
                <Image
                  src={(author.image || author.avatar)!}
                  alt=""
                  width={44}
                  height={44}
                  className="size-11 rounded-full object-cover"
                />
              ) : (
                <div
                  className={`flex size-11 items-center justify-center rounded-full bg-linear-to-br ${gradientFor(name)} text-sm font-black text-primary-foreground`}
                >
                  {name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <OnlineDot lastSeenAt={author.lastSeenAt} now={now} className="-top-0.5 -left-0.5 size-3.5" />
              <RankBadge rank={author.soloRank} />
            </Link>

            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h3 className="truncate font-bold">
                  <Link href={`/players/${encodeURIComponent(author.username)}`} className="hover:text-primary hover:underline">
                    {name}
                  </Link>
                </h3>
                {riotName && (
                  <span className="truncate font-mono text-xs text-muted-foreground">
                    {riotName}
                    {riotTag && <span className="text-electric">#{riotTag}</span>}
                  </span>
                )}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                {author.mainRole && (
                  <span className="inline-flex h-6 items-center gap-1.5 rounded-md border border-border bg-popover/60 px-2 text-xs font-semibold">
                    {roleOf(author.mainRole) && (
                      <Image src={roleOf(author.mainRole)!.icon} alt="" width={13} height={13} />
                    )}
                    {shortRole(author.mainRole)} main
                  </span>
                )}
                {mode && (
                  <span className="inline-flex h-6 items-center rounded-md border border-electric/30 bg-electric/[0.06] px-2 text-xs font-semibold text-electric">
                    {mode.short}
                  </span>
                )}
                <span className="font-mono text-xs text-muted-foreground">
                  {wasBumped ? "bumped " : ""}
                  {formatRelativeTime(post.bumpedAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex w-24 shrink-0 flex-col items-center">
            {rank?.icon ? (
              <div className="relative size-14">
                <div className="absolute inset-1 rounded-full bg-(--tier) opacity-40 blur-xl" />
                <Image src={rank.icon} alt="" fill sizes="56px" className="object-contain" />
              </div>
            ) : (
              <div className="flex size-14 items-center justify-center rounded-full border border-dashed border-border" />
            )}
            <div className="mt-1 text-center font-display text-[10px] font-black uppercase tracking-wide">
              {rank?.label ?? "Unranked"}
            </div>
          </div>
        </header>

        {post.description && <ClampedText key={post.description} text={post.description} className="mt-4" />}

        <div className="mt-auto pt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Looking for
        </div>
        <div className="mt-2.5 grid grid-cols-1 gap-2 min-[440px]:grid-cols-3">
          <LookingForChip
            label="Role"
            value={shortRole(post.role)}
            icon={
              roleOf(post.role) ? <Image src={roleOf(post.role)!.icon} alt="" width={18} height={18} /> : null
            }
          />
          <LookingForChip
            label="Min rank"
            value={minRank ? `${tierLabel(minRank.tier)}+` : "Any"}
            icon={minRank?.badge ? <Image src={minRank.badge} alt="" width={22} height={22} /> : null}
          />
          <LookingForChip
            label="Region"
            value={region?.label ?? post.region}
            icon={
              <span className="font-mono text-[9px] font-bold text-electric">{region?.code ?? post.region}</span>
            }
          />
        </div>

        <footer className="mt-5 flex min-h-12 flex-wrap items-center justify-between gap-2 border-t border-border pt-4">
          {post.relation === "self" ? (
            <>
              <div className="min-w-0">
                <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">Your post</div>
                <div
                  className={`mt-0.5 flex items-center gap-1 text-xs ${expired ? "text-accent" : "text-muted-foreground"}`}
                >
                  <Hourglass className="size-3" />
                  {expired ? "Expired · hidden from the feed" : `Live for ${formatDuration(timeLeft)}`}
                </div>
                {(bump.error ?? removePost.error) && (
                  <div className="mt-0.5 text-xs text-destructive">{(bump.error ?? removePost.error)?.message}</div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={expired ? "default" : "secondary"}
                  disabled={bump.isPending || bumpWait > 0}
                  title={bumpWait > 0 ? `You can bump again in ${formatDuration(bumpWait)}` : "Move to the top and reset the timer"}
                  onClick={() => bump.mutate()}
                >
                  {bump.isPending ? <Loader2 className="animate-spin" /> : <ArrowUp />}
                  {bumpWait > 0 ? `Bump in ${formatDuration(bumpWait)}` : "Bump"}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setPostId(post.id);
                    setShouldOpenEditDialog(true);
                  }}
                >
                  <Pencil /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={removePost.isPending}
                  onClick={() => (confirmDelete ? removePost.mutate() : setConfirmDelete(true))}
                  onBlur={() => setConfirmDelete(false)}
                >
                  {removePost.isPending ? <Loader2 className="animate-spin" /> : <Trash2 />}
                  {confirmDelete ? "Confirm delete" : "Delete"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <span className="text-xs text-destructive">
                {(sendRequest.error ?? acceptRequest.error)?.message}
              </span>
              {post.relation === "friend" ? (
                <span className="inline-flex h-8 items-center gap-1.5 rounded-[10px] border border-success/40 bg-success/10 px-3 text-xs font-semibold text-success">
                  <Check className="size-4" /> Friends
                </span>
              ) : post.relation === "sent" ? (
                <Button size="sm" variant="ghost" disabled>
                  <Clock /> Request sent
                </Button>
              ) : post.relation === "incoming" ? (
                <Button size="sm" disabled={acceptRequest.isPending} onClick={() => acceptRequest.mutate()}>
                  {acceptRequest.isPending ? <Loader2 className="animate-spin" /> : <Check />}
                  Accept request
                </Button>
              ) : (
                <Button size="sm" disabled={sendRequest.isPending} onClick={() => sendRequest.mutate()}>
                  {sendRequest.isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
                  Send request
                </Button>
              )}
            </>
          )}
        </footer>
      </div>
    </article>
  );
};

export default Post;
