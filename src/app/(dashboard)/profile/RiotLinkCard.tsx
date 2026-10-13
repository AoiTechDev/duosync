"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Shown on the profile when no Riot account is linked yet. */
export function RiotLinkCard({ region }: { region: string | null }) {
  const router = useRouter();
  const [riotId, setRiotId] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");

  const [gameName, tagLine] = riotId.split("#").map((s) => s.trim());
  const canVerify = !!gameName && !!tagLine && !!region && !isVerifying;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canVerify) return;
    setIsVerifying(true);
    setError("");
    try {
      const response = await fetch("/api/verify-summoner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameName, tagLine, region }),
      });
      const result = await response.json();
      if (result.success) {
        router.refresh(); // the route saved name and ranks; reload server data
      } else {
        setError(result.message || "Account not found");
      }
    } catch {
      setError("Failed to verify account");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <section className="relative overflow-hidden rounded-2xl border border-primary/30 bg-card/80 p-5">
      <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-primary/15 blur-3xl" />
      <h2 className="relative font-display text-[18px] font-black uppercase tracking-[-0.02em]">Link your Riot ID</h2>
      <p className="relative mt-1 text-sm text-muted-foreground">
        Your rank emblem shows on every post once verified.
      </p>
      <form onSubmit={handleVerify} className="relative mt-4 space-y-3">
        <label htmlFor="riot-id" className="text-xs font-semibold">
          Riot ID
        </label>
        <input
          id="riot-id"
          value={riotId}
          onChange={(e) => {
            setRiotId(e.target.value);
            setError("");
          }}
          placeholder="GameName#TAG"
          autoComplete="off"
          className="h-11 w-full rounded-[10px] border border-border bg-popover/70 px-3 font-mono text-sm outline-none placeholder:text-muted-foreground/60 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
        />
        {error && (
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertCircle className="size-3.5" /> {error}
          </p>
        )}
        {!region && <p className="text-xs text-muted-foreground">Set your region in Edit profile first.</p>}
        <Button type="submit" className="w-full" disabled={!canVerify}>
          {isVerifying && <Loader2 className="animate-spin" />}
          Verify account
        </Button>
      </form>
    </section>
  );
}
