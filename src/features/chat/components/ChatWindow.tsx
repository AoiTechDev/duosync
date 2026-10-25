"use client";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNow } from "@/hooks/use-now";
import { markConversationRead, type ChatMessage, type Conversation } from "../api";
import { CONVERSATIONS_KEY, useConversations } from "../hooks/useConversations";
import { addMessageToCache, messagesKey, useMessages, useSendMessage } from "../hooks/useMessages";
import { useActivity, usePageVisible, useRealtimeInbox } from "../hooks/useRealtimeInbox";
import { useChat } from "../store";
import { ChatAvatar } from "./ConversationList";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";

const NEAR_BOTTOM_PX = 120;
// Polling stays on as the safety net; it only slows down while a live connection covers it.
const POLL_LIVE_MS = 20_000;
const POLL_IDLE_MS = 10_000;
const POLL_MS = 3_000;

export function ChatWindow({
  friendshipId,
  meId,
  otherUser,
  realtimeEnabled,
}: {
  friendshipId: string;
  meId: string;
  otherUser: Conversation["otherUser"];
  realtimeEnabled: boolean;
}) {
  const queryClient = useQueryClient();
  const now = useNow();
  const setActive = useChat((s) => s.setActiveConversationId);
  const visible = usePageVisible();
  const { active, ping } = useActivity();

  const onRealtimeMessage = useCallback(
    (message: ChatMessage) => {
      addMessageToCache(queryClient, message);
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
    [queryClient],
  );
  const live = useRealtimeInbox(meId, realtimeEnabled && visible && active, onRealtimeMessage);

  const { data: conversations } = useConversations();
  const { data, isLoading, isError, error, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useMessages(friendshipId, live ? POLL_LIVE_MS : realtimeEnabled && !active ? POLL_IDLE_MS : POLL_MS);
  const send = useSendMessage(friendshipId, meId);

  const user = conversations?.items.find((c) => c.friendshipId === friendshipId)?.otherUser ?? otherUser;
  // Pages arrive newest-first; the thread renders oldest at the top, then anything still in flight.
  const confirmed = useMemo(() => (data?.pages.flatMap((p) => p.items) ?? []).reverse(), [data]);
  const messages = useMemo(() => [...confirmed, ...send.outgoing], [confirmed, send.outgoing]);
  const newest = messages[messages.length - 1];
  const newestConfirmed = confirmed[confirmed.length - 1];
  const oldestId = messages[0]?.id;

  const scrollRef = useRef<HTMLDivElement>(null);
  const restoreFromBottom = useRef<number | null>(null);
  const lastNewestId = useRef<string | undefined>(undefined);

  useEffect(() => {
    setActive(friendshipId);
    return () => setActive(null);
  }, [friendshipId, setActive]);

  // Catch up on anything sent while the connection was down.
  useEffect(() => {
    if (live) queryClient.invalidateQueries({ queryKey: messagesKey(friendshipId) });
  }, [live, friendshipId, queryClient]);

  // A reply that arrived by polling wakes the live connection back up.
  const newestIncomingId = useMemo(() => {
    for (let i = confirmed.length - 1; i >= 0; i--) if (confirmed[i].senderId !== meId) return confirmed[i].id;
    return undefined;
  }, [confirmed, meId]);
  const seenIncomingId = useRef<string | undefined | null>(null); // null until the first load
  useEffect(() => {
    if (isLoading) return;
    if (seenIncomingId.current !== null && newestIncomingId !== seenIncomingId.current) ping();
    seenIncomingId.current = newestIncomingId;
  }, [isLoading, newestIncomingId, ping]);

  // Keep the viewport anchored when older messages are prepended.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || restoreFromBottom.current === null) return;
    el.scrollTop = el.scrollHeight - restoreFromBottom.current;
    restoreFromBottom.current = null;
  }, [oldestId]);

  // Follow new messages when the reader is already at the bottom or just sent one.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el || !newest || newest.id === lastNewestId.current) return;
    const firstPaint = lastNewestId.current === undefined;
    lastNewestId.current = newest.id;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < NEAR_BOTTOM_PX;
    if (firstPaint || nearBottom || newest.senderId === meId) el.scrollTop = el.scrollHeight;
  }, [newest, meId]);

  useEffect(() => {
    if (isLoading) return;
    markConversationRead(friendshipId)
      .then(() => queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY }))
      .catch(() => {});
  }, [friendshipId, newestConfirmed?.id, isLoading, queryClient]);

  const loadOlder = () => {
    const el = scrollRef.current;
    if (el) restoreFromBottom.current = el.scrollHeight - el.scrollTop;
    fetchNextPage();
  };

  return (
    <Card className="flex h-full min-h-0 flex-col gap-0 overflow-hidden rounded-2xl border-border bg-card/80 py-0">
      <header className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Link
          href="/messages"
          aria-label="Back to messages"
          className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-popover hover:text-foreground lg:hidden"
        >
          <ArrowLeft className="size-4" />
        </Link>
        <ChatAvatar user={user} size={36} now={now} />
        <Link
          href={`/players/${encodeURIComponent(user.username)}`}
          className="truncate font-bold hover:text-primary hover:underline"
        >
          {user.username}
        </Link>
      </header>

      <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
          </div>
        ) : isError ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <p className="text-sm text-muted-foreground">{error.message}</p>
            <Button className="mt-3" size="sm" variant="ghost" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <ChatAvatar user={user} size={56} />
            <p className="mt-3 text-sm text-muted-foreground">
              You and <span className="font-semibold text-foreground">{user.username}</span> are friends. Say hi!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {hasNextPage && (
              <div className="mb-2 flex justify-center">
                <Button size="sm" variant="ghost" disabled={isFetchingNextPage} onClick={loadOlder}>
                  {isFetchingNextPage && <Loader2 className="animate-spin" />}
                  Load older messages
                </Button>
              </div>
            )}
            {messages.map((m) => (
              <MessageBubble
                key={m.id}
                message={m}
                mine={m.senderId === meId}
                onRetry={() => send.retry(m.id)}
                onDiscard={() => send.discard(m.id)}
              />
            ))}
          </div>
        )}
      </div>

      <MessageInput
        onSend={(body) => {
          ping();
          send.send(body);
        }}
        onTyping={ping}
        error={send.error?.message}
      />
    </Card>
  );
}
