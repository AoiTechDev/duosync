"use client";
import { sanitizeUsernameInput } from "@/lib/username";
import { useActionState, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, Check, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { REGION_OPTIONS } from "@/data/regions";
import { updateUserProfile, type UpdateProfileState } from "@/app/actions/auth";

const BIO_MAX = 200;
type NameStatus = "current" | "idle" | "checking" | "available" | "taken";

const inputClass =
  "h-12 w-full rounded-[10px] border bg-card/80 px-4 text-[15px] outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/50 focus:ring-4";

export function EditProfileForm({
  initial,
  summonerName,
}: {
  initial: { username: string; region: string; bio: string };
  summonerName: string | null;
}) {
  const [state, formAction, pending] = useActionState<UpdateProfileState, FormData>(updateUserProfile, {});
  const [username, setUsername] = useState(initial.username);
  const [region, setRegion] = useState(initial.region);
  const [bio, setBio] = useState(initial.bio);
  const [nameStatus, setNameStatus] = useState<NameStatus>("current");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latest = useRef(username);

  useEffect(() => () => clearTimeout(timer.current), []);

  const checkUsername = async (value: string) => {
    setNameStatus("checking");
    try {
      const res = await fetch("/api/auth/check-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: value }),
      });
      const result = await res.json();
      if (latest.current === value) setNameStatus(result.available ? "available" : "taken");
    } catch {
      if (latest.current === value) setNameStatus("idle");
    }
  };

  const handleUsername = (raw: string) => {
    const value = sanitizeUsernameInput(raw);
    setUsername(value);
    latest.current = value;
    clearTimeout(timer.current);
    if (value.trim() === initial.username) return setNameStatus("current");
    setNameStatus("idle");
    if (value.trim().length >= 3) timer.current = setTimeout(() => checkUsername(value.trim()), 400);
  };

  const dirty = username.trim() !== initial.username || region !== initial.region || bio.trim() !== initial.bio;
  const usernameError =
    state.errors?.username ?? (nameStatus === "taken" ? "That username is taken" : undefined);
  const canSave =
    dirty && !pending && username.trim().length >= 3 && !!region && nameStatus !== "taken" && nameStatus !== "checking";

  return (
    <form action={formAction} className="pb-28">
      <div className="mx-auto w-full max-w-[760px] px-5 pt-10">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-electric hover:underline"
        >
          <ArrowLeft className="size-4" /> Back to profile
        </Link>
        <h1 className="mt-3 font-display text-[clamp(34px,5vw,56px)] font-black uppercase leading-[0.95] tracking-[-0.03em]">
          Edit profile
        </h1>

        {state.errors?.form && (
          <div className="mt-6 flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/[0.06] p-3 text-sm text-destructive">
            <AlertCircle className="size-4 shrink-0" /> {state.errors.form}
          </div>
        )}

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-semibold">
              Username
            </label>
            <div className="relative">
              <input
                id="username"
                name="username"
                value={username}
                onChange={(e) => handleUsername(e.target.value)}
                maxLength={24}
                autoComplete="off"
                aria-invalid={!!usernameError}
                className={`${inputClass} pr-10 ${
                  usernameError
                    ? "border-destructive/70 ring-destructive/10"
                    : nameStatus === "available"
                      ? "border-success/60 ring-success/10"
                      : "border-border ring-primary/10 focus:border-primary/60"
                }`}
              />
              <div className="absolute top-1/2 right-3.5 -translate-y-1/2">
                {nameStatus === "checking" && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
                {nameStatus === "available" && <Check className="size-4 text-success" strokeWidth={3} />}
                {nameStatus === "taken" && <X className="size-4 text-destructive" strokeWidth={3} />}
              </div>
            </div>
            <p className={`text-xs ${usernameError ? "text-destructive" : "text-muted-foreground"}`}>
              {usernameError ??
                (nameStatus === "available" ? (
                  <span className="inline-flex items-center gap-1 text-success">
                    <Check className="size-3.5" /> Available
                  </span>
                ) : (
                  "How other players see you on the feed."
                ))}
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="summonerName" className="text-sm font-semibold">
              Summoner name
            </label>
            <input
              id="summonerName"
              value={summonerName ?? ""}
              placeholder="Not linked"
              readOnly
              className={`${inputClass} cursor-default border-border font-mono text-muted-foreground focus:ring-0`}
            />
            <p className="text-xs text-muted-foreground">
              {summonerName ? "Synced from your Riot account." : "Link your Riot ID on your profile."}
            </p>
          </div>
        </div>

        <fieldset className="mt-8">
          <legend className="mb-2.5 text-sm font-semibold">Region</legend>
          <input type="hidden" name="region" value={region} />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {REGION_OPTIONS.map((r) => {
              const selected = region === r.value;
              return (
                <button
                  key={r.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setRegion(r.value)}
                  className={`flex cursor-pointer items-center gap-2.5 rounded-[10px] border px-3 py-2.5 text-left text-sm font-medium transition-colors ${
                    selected
                      ? "border-primary bg-primary/[0.06] text-primary shadow-[0_0_14px_color-mix(in_oklab,var(--primary)_25%,transparent)]"
                      : "border-border bg-card/60 hover:border-input hover:bg-popover"
                  }`}
                >
                  <span className="inline-flex shrink-0 justify-center rounded-md bg-electric/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-electric">
                    {r.code}
                  </span>
                  <span className="leading-tight">{r.label}</span>
                </button>
              );
            })}
          </div>
          {state.errors?.region && <p className="mt-2 text-xs text-destructive">{state.errors.region}</p>}
        </fieldset>

        <div className="mt-8 space-y-2">
          <div className="flex items-baseline justify-between">
            <label htmlFor="bio" className="text-sm font-semibold">
              Bio
            </label>
            <span
              className={`font-mono text-xs ${bio.length >= BIO_MAX ? "text-accent" : "text-muted-foreground"}`}
            >
              {bio.length} / {BIO_MAX}
            </span>
          </div>
          <textarea
            id="bio"
            name="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={BIO_MAX}
            rows={4}
            placeholder="What you play, when you play, what you want in a duo."
            className="w-full resize-y rounded-[10px] border border-border bg-card/80 px-4 py-3 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
          />
          {state.errors?.bio && <p className="text-xs text-destructive">{state.errors.bio}</p>}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-[760px] items-center justify-between gap-3 px-5 py-4">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            {dirty && <span className="size-1.5 rounded-full bg-accent shadow-[0_0_8px_var(--accent)]" />}
            {dirty ? "Unsaved changes" : "No changes"}
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" asChild>
              <Link href="/profile">Cancel</Link>
            </Button>
            <Button type="submit" disabled={!canSave}>
              {pending && <Loader2 className="animate-spin" />}
              Save changes
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
