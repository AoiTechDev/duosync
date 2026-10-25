import { useState } from "react";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
  type InfiniteData,
  type QueryClient,
} from "@tanstack/react-query";
import { getMessages, sendMessage, type ChatMessage, type MessagesPage } from "../api";
import { CONVERSATIONS_KEY } from "./useConversations";

export const messagesKey = (friendshipId: string) => ["messages", friendshipId];

/** Outgoing messages live outside the query cache until the server confirms them, so polls can't drop them. */
export type ThreadMessage = ChatMessage & { failed?: boolean };
type ThreadData = InfiniteData<MessagesPage, string | null>;

export function useMessages(friendshipId: string, refetchInterval: number) {
  return useInfiniteQuery({
    queryKey: messagesKey(friendshipId),
    queryFn: ({ pageParam }) => getMessages(friendshipId, pageParam),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    refetchInterval,
    staleTime: 0,
  });
}

/** Inserts a confirmed message into its thread's cache unless a poll already brought it in. */
export function addMessageToCache(queryClient: QueryClient, message: ChatMessage) {
  queryClient.setQueryData<ThreadData>(messagesKey(message.friendshipId), (data) => {
    if (!data?.pages.length) return data;
    if (data.pages.some((p) => p.items.some((m) => m.id === message.id))) return data;
    const [first, ...rest] = data.pages;
    return { ...data, pages: [{ ...first, items: [message, ...first.items] }, ...rest] };
  });
}

export function useSendMessage(friendshipId: string, meId: string) {
  const queryClient = useQueryClient();
  const [outgoing, setOutgoing] = useState<ThreadMessage[]>([]);

  const mutation = useMutation({
    mutationFn: ({ body }: { tempId: string; body: string }) => sendMessage(friendshipId, body),
    onSuccess: (created, { tempId }) => {
      addMessageToCache(queryClient, created);
      setOutgoing((prev) => prev.filter((m) => m.id !== tempId));
    },
    onError: (_err, { tempId }) => {
      setOutgoing((prev) => prev.map((m) => (m.id === tempId ? { ...m, failed: true } : m)));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_KEY });
    },
  });

  const send = (body: string) => {
    const tempId = `temp-${crypto.randomUUID()}`;
    setOutgoing((prev) => [
      ...prev,
      {
        id: tempId,
        friendshipId,
        senderId: meId,
        type: "TEXT",
        body,
        metadata: null,
        createdAt: new Date().toISOString(),
      },
    ]);
    mutation.mutate({ tempId, body });
  };

  const retry = (tempId: string) => {
    const message = outgoing.find((m) => m.id === tempId);
    if (!message) return;
    setOutgoing((prev) => prev.map((m) => (m.id === tempId ? { ...m, failed: false } : m)));
    mutation.mutate({ tempId, body: message.body });
  };

  const discard = (tempId: string) => setOutgoing((prev) => prev.filter((m) => m.id !== tempId));

  return { outgoing, send, retry, discard, error: mutation.error };
}
