import type { Metadata } from "next";
import { ConversationList } from "@/features/chat/components/ConversationList";

export const metadata: Metadata = { title: "Messages" };

export default function MessagesPage() {
  return (
    <div className="mx-auto w-full max-w-[720px] px-5 pt-10 pb-20">
      <header className="mb-8">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Your squad</div>
        <h1 className="mt-2 font-display text-[clamp(44px,7vw,84px)] font-black uppercase leading-[0.9] tracking-[-0.03em]">
          <span className="text-primary">Messages</span>
        </h1>
      </header>
      <ConversationList />
    </div>
  );
}
