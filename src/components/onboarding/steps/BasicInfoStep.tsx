"use client";
import { sanitizeUsernameInput } from "@/lib/username";
import { useEffect, useRef, useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { useOnboardingStore } from "@/store/onboarding-store";
import { StepShell } from "../StepShell";
import { REGION_OPTIONS as REGIONS } from "@/data/regions";

type Status = "idle" | "checking" | "available" | "taken";

const HELPER: Record<Status, { tag: string; text: string; color: string }> = {
  idle: { tag: "", text: "At least 3 characters. Other players see this on the feed.", color: "text-muted-foreground" },
  checking: { tag: "Checking", text: "Looking it up…", color: "text-muted-foreground" },
  available: { tag: "Available", text: "Nice, nobody has this one.", color: "text-success" },
  taken: { tag: "Taken", text: "Someone already claimed that. Try another.", color: "text-destructive" },
};

export default function BasicInfoStep() {
  const { data, updateData, nextStep } = useOnboardingStore();
  const [username, setUsername] = useState(data.username || "");
  const [region, setRegion] = useState(data.region || "");
  const [status, setStatus] = useState<Status>("idle");
  const [submitting, setSubmitting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latest = useRef(username);

  useEffect(() => () => clearTimeout(timer.current), []);

  const checkUsername = async (value: string): Promise<Status> => {
    if (value.length < 3) return "idle";
    setStatus("checking");
    try {
      const res = await fetch("/api/auth/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: value }),
      });
      const result = await res.json();
      const next: Status = result.available ? "available" : "taken";
      if (latest.current === value) setStatus(next);
      return next;
    } catch {
      if (latest.current === value) setStatus("idle");
      return "idle";
    }
  };

  const handleChange = (raw: string) => {
    const value = sanitizeUsernameInput(raw);
    setUsername(value);
    latest.current = value;
    setStatus("idle");
    clearTimeout(timer.current);
    if (value.length >= 3) timer.current = setTimeout(() => checkUsername(value), 400);
  };

  const handleNext = async () => {
    setSubmitting(true);
    const result = status === "available" ? status : await checkUsername(username);
    setSubmitting(false);
    if (result === "taken") return;
    updateData({ username, region });
    nextStep();
  };

  const canContinue = username.length >= 3 && !!region && status !== "taken" && status !== "checking";
  const helper = HELPER[status];

  return (
    <StepShell
      step={1}
      title="Claim your name"
      subtitle="This is how other players see you on the feed."
      onNext={handleNext}
      nextDisabled={!canContinue}
      nextLoading={submitting}
    >
      <div className="space-y-10">
        <div className="space-y-2.5">
          <label htmlFor="username" className="text-sm font-semibold">
            Username
          </label>
          <div className="relative">
            <input
              id="username"
              value={username}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="nightowl"
              autoComplete="off"
              maxLength={24}
              aria-describedby="username-help"
              className={`h-16 w-full rounded-xl border bg-card/80 px-5 pr-14 text-xl font-semibold outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/50 focus:ring-4 ${
                status === "available"
                  ? "border-success/70 ring-success/10"
                  : status === "taken"
                    ? "border-destructive/70 ring-destructive/10"
                    : "border-border ring-primary/10 focus:border-primary/60"
              }`}
            />
            <div className="absolute top-1/2 right-5 -translate-y-1/2">
              {status === "checking" && <Loader2 className="size-5 animate-spin text-muted-foreground" />}
              {status === "available" && <Check className="size-5 text-success" strokeWidth={2.5} />}
              {status === "taken" && <X className="size-5 text-destructive" strokeWidth={2.5} />}
            </div>
          </div>
          <p id="username-help" className={`flex items-center gap-2.5 text-sm ${helper.color}`} aria-live="polite">
            {helper.tag && (
              <span className="font-mono text-xs uppercase tracking-[0.15em]">{helper.tag}</span>
            )}
            {helper.text}
          </p>
        </div>

        <fieldset className="space-y-2.5">
          <legend className="mb-2.5 text-sm font-semibold">Region</legend>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {REGIONS.map((r) => {
              const selected = region === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setRegion(r.value)}
                  className={`cursor-pointer rounded-xl border p-3.5 text-left transition-all duration-200 ${
                    selected
                      ? "border-primary bg-primary/[0.06] shadow-[0_0_18px_color-mix(in_oklab,var(--primary)_30%,transparent)]"
                      : "border-border bg-card/60 hover:-translate-y-0.5 hover:border-input hover:bg-popover"
                  }`}
                >
                  <span className="inline-flex rounded-md bg-electric/10 px-2 py-0.5 font-mono text-[11px] font-bold text-electric">
                    {r.code}
                  </span>
                  <span className="mt-2 block text-sm font-medium">{r.label}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
    </StepShell>
  );
}
