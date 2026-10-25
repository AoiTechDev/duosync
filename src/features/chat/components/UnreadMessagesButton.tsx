"use client";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { RequestCount } from "@/components/FriendsDropdown";
import { useConversations } from "../hooks/useConversations";
import { useChat } from "../store";

export function UnreadMessagesButton() {
  const { data } = useConversations();
  const activeId = useChat((s) => s.activeConversationId);
  const count = (data?.items ?? []).reduce(
    (sum, c) => sum + (c.friendshipId === activeId ? 0 : c.unreadCount),
    0,
  );

  return (
    <Link
      href="/messages"
      aria-label={`Messages${count ? ` (${count} unread)` : ""}`}
      className="relative flex size-9 items-center justify-center rounded-[10px] border border-border bg-card/70 text-foreground/85 transition-colors hover:border-input hover:bg-popover hover:text-foreground"
    >
      <MessageCircle className="size-[18px]" />
      <span className="absolute -top-1.5 -right-1.5">
        <RequestCount count={count} />
      </span>
    </Link>
  );
}
