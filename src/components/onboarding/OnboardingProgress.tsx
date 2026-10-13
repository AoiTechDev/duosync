"use client";
import { Fragment } from "react";
import { Check } from "lucide-react";
import { useOnboardingStore } from "@/store/onboarding-store";

const STEPS = ["Basic info", "Riot account", "Preferences"];
const HEX = "[clip-path:polygon(25%_4%,75%_4%,100%_50%,75%_96%,25%_96%,0_50%)]";

export function OnboardingProgress() {
  const currentStep = useOnboardingStore((state) => state.currentStep);

  return (
    <ol className="mx-auto flex w-full max-w-[560px] items-start justify-center">
      {STEPS.map((title, i) => {
        const n = i + 1;
        const done = currentStep > n;
        const active = currentStep === n;
        const lit = done || active;

        return (
          <Fragment key={title}>
            <li className="flex w-[104px] shrink-0 flex-col items-center gap-2.5">
              <div
                className={
                  lit ? "drop-shadow-[0_0_10px_color-mix(in_oklab,var(--primary)_55%,transparent)]" : ""
                }
              >
                <div className={`relative size-10 ${HEX} ${lit ? "bg-primary" : "bg-input"}`}>
                  <div
                    className={`absolute inset-[1.5px] flex items-center justify-center text-sm font-bold ${HEX} ${
                      lit ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground"
                    }`}
                  >
                    {done ? <Check className="size-4" strokeWidth={3} /> : n}
                  </div>
                </div>
              </div>
              <span
                className={`text-xs sm:text-sm ${
                  active ? "font-semibold text-primary" : done ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {title}
              </span>
            </li>
            {n < STEPS.length && (
              <li
                aria-hidden
                className={`mt-5 h-0.5 flex-1 rounded-full transition-colors duration-500 ${
                  done
                    ? "bg-primary"
                    : active
                      ? "bg-linear-to-r from-primary to-input"
                      : "bg-input"
                }`}
              />
            )}
          </Fragment>
        );
      })}
    </ol>
  );
}
