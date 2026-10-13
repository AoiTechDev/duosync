"use client";
import { UserPlus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { FriendRequestsList, useInboundRequests } from "./friends/FriendRequestsList";

export function RequestCount({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-primary-foreground shadow-[0_0_10px_var(--accent)]">
      {count}
    </span>
  );
}

const FriendsDropdown = () => {
  const { data } = useInboundRequests();
  const count = data?.items.length ?? 0;

  return (
    <Popover>
      <PopoverTrigger
        aria-label={`Friend requests${count ? ` (${count})` : ""}`}
        className="relative flex size-9 cursor-pointer items-center justify-center rounded-[10px] border border-border bg-card/70 text-foreground/85 transition-colors hover:border-input hover:bg-popover hover:text-foreground data-[state=open]:border-primary/60 data-[state=open]:text-primary"
      >
        <UserPlus className="size-[18px]" />
        <span className="absolute -top-1.5 -right-1.5">
          <RequestCount count={count} />
        </span>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[340px] overflow-hidden rounded-2xl border-border bg-popover/95 p-0 shadow-[0_24px_60px_-20px_rgb(0_0_0/0.8)] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="font-display text-sm font-black uppercase tracking-[-0.01em]">Friend requests</span>
          {count > 0 && (
            <span className="rounded-full bg-accent/15 px-2 py-0.5 font-mono text-xs font-bold text-accent">{count}</span>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          <FriendRequestsList />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FriendsDropdown;
