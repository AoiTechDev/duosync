"use client";
import { useRef, useState } from "react";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/onboarding-store";
import { StepShell } from "../StepShell";
import { RankReveal } from "../RankReveal";

type Status = "idle" | "success" | "error";

export default function RiotAccountStep() {
  const { data, updateData, nextStep, prevStep } = useOnboardingStore();
  const [gameName, setGameName] = useState(data.gameName || "");
  const [tagLine, setTagLine] = useState(data.tagLine || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [status, setStatus] = useState<Status>(data.riotVerified ? "success" : "idle");
  const [error, setError] = useState("");
  const [revealKey, setRevealKey] = useState(0);
  const nameInput = useRef<HTMLInputElement>(null);

  const canVerify = !!gameName.trim() && !!tagLine.trim() && !isVerifying;

  const resetStatus = () => {
    setStatus("idle");
    setError("");
  };

  const handleVerify = async () => {
    if (!canVerify) return;
    setIsVerifying(true);
    setError("");

    try {
      const response = await fetch("/api/verify-summoner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gameName: gameName.trim(), tagLine: tagLine.trim(), region: data.region }),
      });
      const result = await response.json();

      if (result.success) {
        updateData({
          summonerName: result.data.summonerName,
          gameName: gameName.trim(),
          tagLine: tagLine.trim(),
          riotVerified: true,
          soloRank: result.data.soloRank,
          flexRank: result.data.flexRank,
        });
        setStatus("success");
        setRevealKey((k) => k + 1);
      } else {
        setStatus("error");
        setError(result.message || "Account not found");
      }
    } catch {
      setStatus("error");
      setError("Failed to verify account");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleSkip = () => {
    updateData({
      summonerName: "",
      gameName: "",
      tagLine: "",
      riotVerified: false,
      soloRank: undefined,
      flexRank: undefined,
    });
    nextStep();
  };

  const handleChange = () => {
    resetStatus();
    nameInput.current?.focus();
    nameInput.current?.select();
  };

  return (
    <StepShell
      step={2}
      title="Link your Riot ID"
      subtitle="We read your solo and flex rank so your card shows where you really play."
      onBack={prevStep}
      onNext={() => status === "success" && nextStep()}
      nextDisabled={status !== "success"}
      extraAction={
        <Button variant="link" onClick={handleSkip} className="hidden sm:inline-flex">
          Skip for now
        </Button>
      }
      wide
    >
      <div className="space-y-8">
        <div className="space-y-2.5">
          <label htmlFor="gameName" className="text-sm font-semibold">
            Riot ID
          </label>
          <form
            className="flex flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
          >
            <div
              className={`flex h-14 flex-1 items-center rounded-xl border bg-card/80 font-mono transition-[border-color,box-shadow] focus-within:ring-4 ${
                status === "error"
                  ? "border-destructive/70 ring-destructive/10"
                  : status === "success"
                    ? "border-success/50 ring-success/10"
                    : "border-border ring-primary/10 focus-within:border-primary/60"
              }`}
            >
              <input
                ref={nameInput}
                id="gameName"
                value={gameName}
                onChange={(e) => {
                  setGameName(e.target.value);
                  resetStatus();
                }}
                placeholder="Game name"
                autoComplete="off"
                className="h-full min-w-0 flex-1 bg-transparent px-4 text-base outline-none placeholder:text-muted-foreground/50"
              />
              <div className="flex h-full items-center border-l border-border pl-3 text-electric">
                <span aria-hidden>#</span>
                <input
                  aria-label="Tagline"
                  value={tagLine}
                  onChange={(e) => {
                    setTagLine(e.target.value);
                    resetStatus();
                  }}
                  placeholder="TAG"
                  maxLength={5}
                  autoComplete="off"
                  className="h-full w-20 bg-transparent pr-3 pl-0.5 text-base text-electric uppercase outline-none placeholder:text-electric/40"
                />
              </div>
            </div>
            <Button type="submit" disabled={!canVerify} className="h-14 px-7">
              {isVerifying ? (
                <>
                  <Loader2 className="animate-spin" /> Verifying
                </>
              ) : status === "success" ? (
                "Verify again"
              ) : (
                "Verify"
              )}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground">Game name and tagline, exactly as in the Riot client.</p>
        </div>

        {status === "error" && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/[0.06] p-4">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <div>
              <div className="font-semibold text-destructive">We couldn&apos;t verify that account</div>
              <p className="text-sm text-muted-foreground">
                {error}. Check the spelling, the tagline and that your region is right.
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <section
            key={revealKey}
            className="overflow-hidden rounded-2xl border border-primary/25 bg-card/70 shadow-[0_0_40px_color-mix(in_oklab,var(--primary)_8%,transparent)] motion-safe:animate-rise"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-6 py-4">
              <div className="flex items-center gap-3">
                <span className="font-mono text-[18px] font-bold">
                  {data.gameName}
                  <span className="text-electric">#{data.tagLine?.toUpperCase()}</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-semibold text-success">
                  <Check className="size-3.5" strokeWidth={3} /> Verified
                </span>
              </div>
              <button
                type="button"
                onClick={handleChange}
                className="cursor-pointer text-sm font-semibold text-electric hover:underline"
              >
                Not you? Change
              </button>
            </div>
            <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
              <RankReveal queue="Ranked Solo/Duo" rank={data.soloRank} />
              <RankReveal queue="Ranked Flex" rank={data.flexRank} delay={0.3} />
            </div>
          </section>
        )}

        <Button variant="link" onClick={handleSkip} className="px-0 sm:hidden">
          Skip for now
        </Button>
      </div>
    </StepShell>
  );
}
