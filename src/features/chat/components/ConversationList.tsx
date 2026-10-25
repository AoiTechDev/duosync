"use client";
import Link from "next/link";
import { Loader2, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RequestCount } from "@/components/FriendsDropdown";
import { OnlineDot } from "@/components/presence/OnlineDot";
import { useNow } from "@/hooks/use-now";
import { formatRelativeTime } from "@/lib/utils";
import type { Conversation } from "../api";
import { useConversations } from "../hooks/useConversations";
import { useChat } from "../store";

export function ChatAvatar({
  user,
  size = 40,
  now,
}: {
  user: Conversation["otherUser"];
  size?: number;
  now?: number;
}) {
  return (
    <span className="relative inline-flex shrink-0">
      <Avatar style={{ width: size, height: size }}>
        <AvatarImage src={user.image || user.avatar || undefined} alt="" className="object-cover" />
        <AvatarFallback className="bg-linear-to-br from-primary to-accent text-xs font-black text-primary-foreground">
          {user.username.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <OnlineDot lastSeenAt={user.lastSeenAt} now={now} className="-top-0.5 -left-0.5 size-3" />
    </span>
  );
}

function preview(c: Conversation) {
  if (!c.lastMessage) return "Say hi 👋";
  const prefix = c.lastMessage.senderId === c.otherUser.id ? "" : "You: ";
  return `${prefix}${c.lastMessage.body}`;
}

export function ConversationList({ compact }: { compact?: boolean }) {
  const { data, isLoading, isError, refetch } = useConversations();
  const activeId = useChat((s) => s.activeConversationId);
  const now = useNow();
  const items = data?.items ?? [];

  return (
    <Card className="gap-0 overflow-hidden rounded-2xl border-border bg-card/80 py-0">
      {isLoading ? (
        <div className="flex justify-center py-12 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : isError ? (
        <div className="px-6 py-10 text-center">
          <p className="text-sm text-muted-foreground">Couldn&apos;t load your conversations.</p>
          <Button className="mt-3" size="sm" variant="ghost" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-12 text-center">
          <div className="flex size-11 items-center justify-center rounded-full bg-popover text-primary">
            <MessageCircle className="size-5" />
          </div>
          <h3 className="mt-4 font-display text-[18px] font-black uppercase">No conversations yet</h3>
          <p className="mt-1 max-w-xs text-sm text-muted-foreground">
            Chat unlocks once a duo request is accepted. Add friends from the feed to start talking.
          </p>
          <Button asChild size="sm" className="mt-5">
            <Link href="/feed">Browse the feed</Link>
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((c) => {
            const active = c.friendshipId === activeId;
            const unread = active ? 0 : c.unreadCount;
            return (
              <li key={c.friendshipId}>
                <Link
                  href={`/messages/${c.friendshipId}`}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 transition-colors ${compact ? "px-3 py-2.5" : "px-4 py-3"} ${
                    active ? "bg-primary/[0.07]" : "hover:bg-popover/60"
                  }`}
                >
                  <ChatAvatar user={c.otherUser} size={compact ? 36 : 44} now={now} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className={`truncate text-sm ${unread ? "font-bold" : "font-semibold"}`}>
                        {c.otherUser.username}
                      </span>
                      {c.lastMessage && (
                        <span className="shrink-0 font-mono text-[10px] uppercase text-muted-foreground">
                          {formatRelativeTime(new Date(c.lastMessage.createdAt))}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <p
                        className={`truncate text-xs ${
                          unread ? "font-semibold text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {preview(c)}
                      </p>
                      <RequestCount count={unread} />
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
