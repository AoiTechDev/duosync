"use client";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { Check, Clock, Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { acceptFriendRequest, sendFriendRequest } from "@/features/friends/api";
import type { PostRelation } from "@/lib/db";

export function ProfileAction({
  userId,
  relation,
  requestId,
  className = "",
}: {
  userId: string;
  relation: PostRelation;
  requestId?: string;
  className?: string;
}) {
  const router = useRouter();
  const send = useMutation({ mutationFn: () => sendFriendRequest(userId), onSuccess: () => router.refresh() });
  const accept = useMutation({ mutationFn: () => acceptFriendRequest(requestId!), onSuccess: () => router.refresh() });
  const error = (send.error ?? accept.error)?.message;

  return (
    <div className={`flex flex-col items-start gap-1.5 ${className}`}>
      {relation === "friend" ? (
        <span className="inline-flex h-10 items-center gap-1.5 rounded-[10px] border border-success/40 bg-success/10 px-4 text-sm font-semibold text-success">
          <Check className="size-4" strokeWidth={3} /> Friends
        </span>
      ) : relation === "sent" ? (
        <Button variant="ghost" disabled>
          <Clock /> Request sent
        </Button>
      ) : relation === "incoming" ? (
        <Button disabled={accept.isPending} onClick={() => accept.mutate()}>
          {accept.isPending ? <Loader2 className="animate-spin" /> : <Check />}
          Accept request
        </Button>
      ) : (
        <Button disabled={send.isPending} onClick={() => send.mutate()}>
          {send.isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
          Send request
        </Button>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
