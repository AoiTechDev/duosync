"use client";
import { useState, type ReactNode } from "react";
import Image from "next/image";
import { AlertCircle } from "lucide-react";
import { useOnboardingStore } from "@/store/onboarding-store";
import { ROLES, GOALS, PLAYSTYLE_TAGS, COMMUNICATION_PREFERENCES } from "@/data/preferences";
import { TagButton } from "@/components/common/TagButton";
import { StepShell } from "../StepShell";

interface PreferencesState {
  mainRole: string;
  secondaryRole: string;
  goals: string[];
  playstyleTags: string[];
  communication: string[];
}

const LANE_ROLES = ROLES.filter((r) => r.id !== "FILL");
const MAX_PLAYSTYLE = 8;

function Section({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <section className="space-y-3.5">
      <h2 className="flex items-baseline gap-3 font-mono text-xs uppercase tracking-[0.2em] text-foreground/85">
        {label}
        {hint && <span className="text-[11px] tracking-[0.12em] text-muted-foreground">{hint}</span>}
      </h2>
      {children}
    </section>
  );
}

function RoleTile({
  role,
  selected,
  disabled,
  compact,
  onClick,
}: {
  role: (typeof LANE_ROLES)[number];
  selected: boolean;
  disabled?: boolean;
  compact?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      onClick={onClick}
      className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30 ${
        compact ? "h-24 gap-2" : "h-32 gap-3"
      } ${
        selected
          ? "border-primary bg-[radial-gradient(circle_at_50%_40%,color-mix(in_oklab,var(--primary)_16%,transparent),transparent_70%)] text-primary shadow-[0_0_22px_color-mix(in_oklab,var(--primary)_30%,transparent)]"
          : "border-border bg-card/70 enabled:hover:-translate-y-0.5 enabled:hover:border-input enabled:hover:bg-popover"
      }`}
    >
      <Image
        src={role.icon}
        alt=""
        width={compact ? 28 : 44}
        height={compact ? 28 : 44}
        className={`transition-transform duration-200 ${selected ? "scale-110" : ""}`}
      />
      <span className={`font-semibold ${compact ? "text-xs" : "text-sm"}`}>
        {role.name.replace(" Lane", "")}
      </span>
    </button>
  );
}

export default function PreferencesStep() {
  const { data, updateData, prevStep, completeOnboarding } = useOnboardingStore();
  const [preferences, setPreferences] = useState<PreferencesState>({
    mainRole: data.mainRole || "",
    secondaryRole: data.secondaryRole || "",
    goals: data.goals || [],
    playstyleTags: data.playstyleTags || [],
    communication: data.communication || [],
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const update = <K extends keyof PreferencesState>(key: K, value: PreferencesState[K]) =>
    setPreferences((prev) => ({ ...prev, [key]: value }));

  const toggle = (key: "goals" | "playstyleTags" | "communication", value: string) => {
    const list = preferences[key];
    update(key, list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);
  };

  const setMainRole = (id: string) =>
    setPreferences((prev) => ({
      ...prev,
      mainRole: id,
      // A role can't be both main and secondary.
      secondaryRole: prev.secondaryRole === id ? "" : prev.secondaryRole,
    }));

  const handleContinue = async () => {
    const missing: string[] = [];
    if (!preferences.mainRole) missing.push("Pick a main role");
    if (preferences.goals.length === 0) missing.push("Pick at least one goal");
    if (preferences.communication.length === 0) missing.push("Pick how you like to communicate");
    setErrors(missing);
    if (missing.length) return;

    updateData(preferences);
    setSubmitting(true);
    await completeOnboarding(); // redirects to /posts on success
    setSubmitting(false);
  };

  const isValid =
    !!preferences.mainRole && preferences.goals.length > 0 && preferences.communication.length > 0;

  return (
    <StepShell
      step={3}
      title="How you play"
      subtitle="Used to match you with duos whose roles and style fit yours."
      onBack={prevStep}
      onNext={handleContinue}
      nextLabel="Enter the feed"
      nextDisabled={!isValid}
      nextLoading={submitting}
      wide
    >
      <div className="space-y-10">
        <Section label="Main role">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {LANE_ROLES.map((role) => (
              <RoleTile
                key={role.id}
                role={role}
                selected={preferences.mainRole === role.id}
                onClick={() => setMainRole(role.id)}
              />
            ))}
          </div>
        </Section>

        <Section label="Secondary role" hint="Optional">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
            {LANE_ROLES.map((role) => {
              const selected = preferences.secondaryRole === role.id;
              return (
                <RoleTile
                  key={role.id}
                  role={role}
                  compact
                  selected={selected}
                  disabled={preferences.mainRole === role.id}
                  onClick={() => update("secondaryRole", selected ? "" : role.id)}
                />
              );
            })}
          </div>
        </Section>

        <div className="grid gap-10 sm:grid-cols-2 sm:gap-8">
          <Section label="Goals">
            <div className="flex flex-wrap gap-2">
              {GOALS.map((goal) => (
                <TagButton
                  key={goal.id}
                  selected={preferences.goals.includes(goal.id)}
                  onClick={() => toggle("goals", goal.id)}
                  label={goal.name}
                />
              ))}
            </div>
          </Section>

          <Section label="Playstyle" hint={`${preferences.playstyleTags.length}/${MAX_PLAYSTYLE}`}>
            <div className="flex flex-wrap gap-2">
              {PLAYSTYLE_TAGS.map((tag) => {
                const selected = preferences.playstyleTags.includes(tag.id);
                return (
                  <TagButton
                    key={tag.id}
                    selected={selected}
                    disabled={!selected && preferences.playstyleTags.length >= MAX_PLAYSTYLE}
                    onClick={() => toggle("playstyleTags", tag.id)}
                    label={tag.name}
                  />
                );
              })}
            </div>
          </Section>
        </div>

        <Section label="Communication">
          <div className="flex flex-wrap gap-2">
            {COMMUNICATION_PREFERENCES.map((pref) => (
              <TagButton
                key={pref.id}
                selected={preferences.communication.includes(pref.id)}
                onClick={() => toggle("communication", pref.id)}
                label={pref.name}
              />
            ))}
          </div>
        </Section>

        {errors.length > 0 && (
          <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/[0.06] p-4">
            <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
            <ul className="space-y-1 text-sm text-foreground/90">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </StepShell>
  );
}
