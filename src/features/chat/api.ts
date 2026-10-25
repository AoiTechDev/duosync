import type { GameInviteMetadata, MessageType } from "@/db/schema";

export type ChatMessage = {
  id: string;
  friendshipId: string;
  senderId: string;
  type: MessageType;
  body: string;
  metadata: GameInviteMetadata | null;
  createdAt: string;
};

export type Conversation = {
  friendshipId: string;
  otherUser: {
    id: string;
    username: string;
    image: string | null;
    avatar: string | null;
    soloRank: string | null;
    lastSeenAt: string | null;
  };
  lastMessage: Pick<ChatMessage, "id" | "senderId" | "type" | "body" | "createdAt"> | null;
  lastMessageAt: string | null;
  unreadCount: number;
};

export type MessagesPage = { items: ChatMessage[]; nextCursor: string | null };

async function throwWithMessage(res: Response, fallback: string): Promise<never> {
  let message = fallback;
  try {
    const data = await res.json();
    message = data?.error || message;
  } catch {}
  throw new Error(message);
}

export async function getConversations(): Promise<{ items: Conversation[] }> {
  const res = await fetch("/api/conversations", { cache: "no-store" });
  if (!res.ok) await throwWithMessage(res, "Failed to load conversations");
  return res.json();
}

export async function getInboxVersion(): Promise<{ version: number | null }> {
  const res = await fetch("/api/conversations/version", { cache: "no-store" });
  if (!res.ok) await throwWithMessage(res, "Failed to check inbox");
  return res.json();
}

export async function getMessages(friendshipId: string, cursor?: string | null): Promise<MessagesPage> {
  const params = new URLSearchParams({ limit: "30" });
  if (cursor) params.set("cursor", cursor);
  const res = await fetch(`/api/conversations/${friendshipId}/messages?${params}`, { cache: "no-store" });
  if (!res.ok) await throwWithMessage(res, "Failed to load messages");
  return res.json();
}

export async function sendMessage(friendshipId: string, body: string): Promise<ChatMessage> {
  const res = await fetch(`/api/conversations/${friendshipId}/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) await throwWithMessage(res, "Failed to send message");
  return res.json();
}

export async function markConversationRead(friendshipId: string) {
  const res = await fetch(`/api/conversations/${friendshipId}/read`, { method: "POST" });
  if (!res.ok) await throwWithMessage(res, "Failed to mark conversation read");
  return res.json();
}
