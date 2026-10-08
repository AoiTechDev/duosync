"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, UserPlus } from "lucide-react";

const FriendsDropdown = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["friends", "requests", "inbound"],
    queryFn: async () => {
      const res = await fetch(`/api/friends/request?direction=inbound&limit=10`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to load requests");
      return res.json() as Promise<{ items: { id: string; createdAt: string; status: string; otherUser: { id: string; username: string | null; image: string | null } }[] }>;
    },
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const items = data?.items ?? [];

  return (
    <Popover>
      <PopoverTrigger className="relative inline-flex items-center">
        <UserPlus className="h-5 w-5" />
        {items.length > 0 && (
          <span className="ml-1 inline-flex items-center justify-center rounded-full bg-red-600 text-white text-xs px-1.5 min-w-5 h-5">
            {items.length}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <div className="p-3 border-b text-sm font-semibold">Friend requests</div>
        <div className="max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Loading...
            </div>
          ) : isError ? (
            <div className="p-4 text-sm text-red-600">
              Failed to load. <button className="underline" onClick={() => refetch()}>Retry</button>
            </div>
          ) : items.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No pending requests</div>
          ) : (
            <ul className="divide-y">
              {items.map((r) => (
                <li key={r.id} className="p-3 flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={r.otherUser.image || undefined} />
                    <AvatarFallback>{r.otherUser.username?.slice(0, 2)?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{r.otherUser.username ?? "Unknown"}</div>
                    <div className="text-xs text-muted-foreground">sent a friend request</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="p-2 border-t text-right">
          <Button size="sm" variant="ghost" onClick={() => refetch()}>Refresh</Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FriendsDropdown;
