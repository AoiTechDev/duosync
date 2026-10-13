"use client";
import type { ReactNode } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function StepShell({
  step,
  title,
  subtitle,
  children,
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled,
  nextLoading,
  extraAction,
  wide,
}: {
  step: number;
  title: string;
  subtitle: string;
  children: ReactNode;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  /** Rendered next to the primary button, e.g. "Skip for now". */
  extraAction?: ReactNode;
  /** Wider column for steps with more content side by side. */
  wide?: boolean;
}) {
  const column = `mx-auto w-full px-5 ${wide ? "max-w-[800px]" : "max-w-[680px]"}`;

  return (
    <div className="motion-safe:animate-rise">
      <div className={column}>
        <header className="mb-10 space-y-3">
          <div className="font-mono text-xs uppercase tracking-[0.2em] text-primary">
            Step {step} of 3
          </div>
          <h1 className="font-display text-[clamp(30px,3.8vw,52px)] font-black uppercase leading-[0.95] tracking-[-0.03em]">
            {title}
          </h1>
          <p className="text-base text-muted-foreground">{subtitle}</p>
        </header>
        {children}
      </div>

      <footer className="mt-12 border-t border-border">
        <div className={`${column} flex items-center justify-between gap-3 py-5`}>
          <Button variant="ghost" onClick={onBack} disabled={!onBack}>
            Back
          </Button>
          <div className="flex items-center gap-2">
            {extraAction}
            <Button onClick={onNext} disabled={nextDisabled || nextLoading}>
              {nextLoading ? <Loader2 className="animate-spin" /> : null}
              {nextLabel}
              {!nextLoading && <ArrowRight />}
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
