"use client";
import { useActionState, useState, type ReactNode } from "react";
import Image from "next/image";
import { AlertCircle, Loader2, X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { DialogClose, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/data/preferences";
import { REGION_OPTIONS } from "@/data/regions";
import { parseRank, TIER_ORDER, tierLabel } from "@/lib/rank";
import { createPost, editPost } from "@/app/(dashboard)/posts/actions";

const DESCRIPTION_MAX = 280;
const LANES = ROLES.filter((r) => r.id !== "FILL");

type ActionState = { errors?: Record<string, string[]>; success?: boolean } | undefined;

export interface PostFormValues {
  description: string;
  role: string | null;
  rank: string | null;
  region: string | null;
}

function Field({ label, aside, error, children }: { label: ReactNode; aside?: ReactNode; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold">{label}</span>
        {aside}
      </div>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="size-3.5" /> {error}
        </p>
      )}
    </div>
  );
}

export function PostForm({
  mode,
  initial,
  postId,
  onDone,
}: {
  mode: "create" | "edit";
  initial: PostFormValues;
  postId?: string;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const [values, setValues] = useState(initial);
  const set = <K extends keyof PostFormValues>(key: K, value: PostFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const [state, formAction, pending] = useActionState<ActionState, FormData>(async (prev, formData) => {
    const result = await (mode === "create" ? createPost : editPost)(prev, formData);
    if (result?.success) {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      onDone();
    }
    return result;
  }, undefined);

  const error = (field: string) => state?.errors?.[field]?.[0];
  const minRank = parseRank(values.rank);

  return (
    <form action={formAction}>
      {postId && <input type="hidden" name="postId" value={postId} />}
      <input type="hidden" name="role" value={values.role ?? ""} />
      <input type="hidden" name="rank" value={values.rank ?? ""} />
      <input type="hidden" name="region" value={values.region ?? ""} />

      <div className="space-y-5 px-6 pt-6 pb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">Duo feed</div>
            <DialogTitle className="mt-1 font-display text-[26px] leading-none font-black uppercase tracking-[-0.02em]">
              {mode === "create" ? "New duo request" : "Edit duo request"}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Describe who you are looking for, then pick a role, minimum rank and region.
            </DialogDescription>
          </div>
          <DialogClose
            aria-label="Close"
            className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-border text-muted-foreground transition-colors hover:border-input hover:bg-popover hover:text-foreground"
          >
            <X className="size-4" />
          </DialogClose>
        </div>

        <Field
          label={<label htmlFor="post-description">Description</label>}
          aside={
            <span
              className={`font-mono text-xs ${values.description.length >= DESCRIPTION_MAX ? "text-accent" : "text-muted-foreground"}`}
            >
              {values.description.length} / {DESCRIPTION_MAX}
            </span>
          }
          error={error("description")}
        >
          <textarea
            id="post-description"
            name="description"
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            maxLength={DESCRIPTION_MAX}
            rows={3}
            placeholder="Who are you looking for? Champions, schedule, how you like to play."
            className="w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
          />
        </Field>

        <Field label="Looking for role" error={error("role")}>
          <div className="grid grid-cols-5 gap-2">
            {LANES.map((role) => {
              const selected = values.role === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => set("role", role.id)}
                  className={`flex h-[72px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border transition-all duration-200 ${
                    selected
                      ? "border-primary bg-primary/[0.07] text-primary shadow-[0_0_18px_color-mix(in_oklab,var(--primary)_30%,transparent)]"
                      : "border-border bg-background/40 hover:border-input hover:bg-popover"
                  }`}
                >
                  <Image src={role.icon} alt="" width={24} height={24} />
                  <span className="text-xs font-semibold">{role.name.replace(" Lane", "")}</span>
                </button>
              );
            })}
          </div>
        </Field>

        <Field
          label={
            <span className="flex items-baseline gap-2">
              Minimum rank
              {minRank && <span className="text-xs font-bold text-primary">{tierLabel(minRank.tier)}+</span>}
            </span>
          }
          error={error("rank")}
        >
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
            {TIER_ORDER.map((tier) => {
              const rank = parseRank(tier)!;
              const selected = values.rank === tier;
              return (
                <button
                  key={tier}
                  type="button"
                  aria-pressed={selected}
                  aria-label={`${tierLabel(tier)} or higher`}
                  title={tierLabel(tier)}
                  onClick={() => set("rank", tier)}
                  className={`group flex aspect-square cursor-pointer items-center justify-center rounded-[10px] border transition-all duration-200 ${
                    selected
                      ? "border-primary bg-primary/[0.07] shadow-[0_0_16px_color-mix(in_oklab,var(--primary)_35%,transparent)]"
                      : "border-border bg-background/40 hover:border-input"
                  }`}
                >
                  {rank.icon && (
                    <Image
                      src={rank.icon}
                      alt=""
                      width={30}
                      height={30}
                      className={`transition-[filter,opacity,transform] duration-200 ${
                        selected ? "scale-110" : "opacity-45 grayscale-[0.6] group-hover:opacity-90 group-hover:grayscale-0"
                      }`}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </Field>

        <Field label="Region" error={error("region")}>
          <Select value={values.region ?? ""} onValueChange={(v) => set("region", v)}>
            <SelectTrigger className="h-12 w-full rounded-xl border-border bg-background/60 px-3 text-[15px]">
              <SelectValue placeholder="Pick a region" />
            </SelectTrigger>
            <SelectContent>
              {REGION_OPTIONS.map((r) => (
                <SelectItem key={r.value} value={r.value} className="py-2">
                  <span className="inline-flex min-w-11 justify-center rounded-md bg-electric/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-electric">
                    {r.code}
                  </span>
                  {r.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border bg-background/40 px-6 py-4">
        <span className="text-xs text-destructive">{error("database")}</span>
        <div className="flex gap-2">
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="animate-spin" />}
            {mode === "create" ? "Post request" : "Save changes"}
          </Button>
        </div>
      </div>
    </form>
  );
}

export const postDialogClass =
  "max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-2xl border-border bg-card p-0 shadow-[0_30px_80px_-20px_rgb(0_0_0/0.85),0_0_60px_-30px_var(--primary)] sm:max-w-[560px] before:absolute before:inset-x-0 before:top-0 before:h-0.5 before:bg-linear-to-r before:from-primary before:via-accent before:to-transparent";
