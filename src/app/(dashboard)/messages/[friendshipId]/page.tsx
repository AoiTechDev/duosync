import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/db/schema";
import { authorizeFriendship } from "@/lib/chat";
import { isRealtimeEnabled } from "@/lib/realtime";
import { ChatWindow } from "@/features/chat/components/ChatWindow";
import { ConversationList } from "@/features/chat/components/ConversationList";

export const metadata: Metadata = { title: "Messages" };

export default async function ConversationPage({ params }: { params: Promise<{ friendshipId: string }> }) {
  const me = await getCurrentUser();
  if (!me) {
    redirect("/login");
  }

  const { friendshipId } = await params;
  const auth = await authorizeFriendship(friendshipId, me.id);
  if ("error" in auth) {
    notFound();
  }

  const other = await db.query.users.findFirst({
    where: eq(users.id, auth.otherUserId),
    columns: { id: true, username: true, image: true, avatar: true, soloRank: true, lastSeenAt: true },
  });
  if (!other) {
    notFound();
  }

  return (
    <div className="mx-auto grid h-[calc(100dvh-4rem)] w-full max-w-[1120px] gap-6 px-5 py-6 lg:grid-cols-[320px_1fr]">
      <aside className="hidden min-h-0 overflow-y-auto lg:block">
        <ConversationList compact />
      </aside>
      <ChatWindow
        friendshipId={friendshipId}
        meId={me.id}
        otherUser={{ ...other, lastSeenAt: other.lastSeenAt?.toISOString() ?? null }}
        realtimeEnabled={isRealtimeEnabled()}
      />
    </div>
  );
}
