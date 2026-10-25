import * as Ably from "ably";
import type { Message } from "@/lib/db";
import { inboxChannel } from "@/features/chat/channels";

// Each user has one private channel. A client subscribes only while a chat is open and active, so
// realtime is an add-on: polling still delivers everything if no connection is open.
export const isRealtimeEnabled = () => !!process.env.ABLY_API_KEY;

let rest: Ably.Rest | null = null;

export function ablyRest() {
  if (!process.env.ABLY_API_KEY) return null;
  rest ??= new Ably.Rest({ key: process.env.ABLY_API_KEY });
  return rest;
}

export async function publishMessage(recipientId: string, message: Message) {
  const client = ablyRest();
  if (!client) return;
  try {
    await client.channels.get(inboxChannel(recipientId)).publish("message", message);
  } catch (error) {
    console.error("Realtime publish failed:", error);
  }
}
