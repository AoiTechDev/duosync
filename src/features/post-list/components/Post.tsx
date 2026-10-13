"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Clock, Loader2, Pencil, Trash2, UserPlus } from "lucide-react";
import type { FeedPost } from "@/lib/db";
import { ROLES } from "@/data/preferences";
import { findRegion } from "@/data/regions";
import { parseRank, tierLabel } from "@/lib/rank";
import { formatRelativeTime } from "@/lib/utils";
import { useFormStore } from "@/store/create-post-store";
import { Button } from "@/components/ui/button";
import { acceptFriendRequest, sendFriendRequest } from "@/features/friends/api";
import { deletePost } from "@/app/(dashboard)/posts/actions";

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
        <div className="truncate text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}

const Post = ({ post }: { post: FeedPost }) => {
  const queryClient = useQueryClient();
  const { setPostId, setShouldOpenEditDialog } = useFormStore();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const author = post.author;
  const rank = parseRank(author.soloRank);
  const minRank = parseRank(post.rank);
  const region = findRegion(post.region);
  const [riotName, riotTag] = (author.summonerName ?? "").split("#");
  const name = author.username || author.name || "Player";

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["posts"] });

  const sendRequest = useMutation({
    mutationFn: () => sendFriendRequest(author.id),
    onSettled: refresh,
  });
  const acceptRequest = useMutation({
    mutationFn: () => acceptFriendRequest(post.requestId!),
    onSettled: () => {
      refresh();
      queryClient.invalidateQueries({ queryKey: ["friends", "requests", "inbound"] });
    },
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
      className="group relative overflow-hidden rounded-2xl border border-border bg-card/90 shadow-[0_22px_50px_-28px_color-mix(in_oklab,var(--tier)_70%,transparent)] transition-[transform,border-color] duration-200 hover:-translate-y-0.5 hover:border-[color-mix(in_oklab,var(--tier)_40%,var(--border))] motion-safe:animate-rise"
    >
      {/* Tier edge + glow */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-(--tier) to-transparent opacity-80" />
      <div className="pointer-events-none absolute -top-28 -right-20 size-72 rounded-full bg-(--tier) opacity-[0.16] blur-3xl" />

      <div className="relative p-5">
        <header className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="relative shrink-0">
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
              {rank?.icon && (
                <div className="absolute -right-1 -bottom-1 flex size-5 items-center justify-center rounded-full border border-border bg-card">
                  <Image src={rank.icon} alt="" width={14} height={14} />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h3 className="truncate font-bold">{name}</h3>
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
                <span className="font-mono text-xs text-muted-foreground">
                  {formatRelativeTime(post.createdAt)}
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

        {post.description && (
          <p className="mt-4 text-[15px] leading-relaxed text-foreground/90">{post.description}</p>
        )}

        <div className="mt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
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
            icon={minRank?.icon ? <Image src={minRank.icon} alt="" width={22} height={22} /> : null}
          />
          <LookingForChip
            label="Region"
            value={region?.label ?? post.region}
            icon={
              <span className="font-mono text-[9px] font-bold text-electric">{region?.code ?? post.region}</span>
            }
          />
        </div>

        <footer className="mt-5 flex min-h-12 items-center justify-between gap-2 border-t border-border pt-4">
          {post.relation === "self" ? (
            <>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">Your post</span>
              <div className="flex gap-2">
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
                {(sendRequest.error ?? acceptRequest.error ?? removePost.error)?.message}
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
