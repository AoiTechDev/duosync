"use client";
import { useState, type FormEvent } from "react";
import { usePathname } from "next/navigation";
import { AlertCircle, Bug, CheckCircle2, Loader2, X } from "lucide-react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { postDialogClass } from "@/features/post-form/PostForm";
import { BUG_CATEGORIES, BUG_MESSAGE_MAX, BUG_MESSAGE_MIN, type BugCategory } from "./constants";
import { useReportBug } from "./store";

const FALLBACK_ERROR = "Couldn't send the report, please try again";

function Header() {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">Feedback</div>
        <DialogTitle className="mt-1 font-display text-[26px] leading-none font-black uppercase tracking-[-0.02em]">
          Report a bug
        </DialogTitle>
        <DialogDescription className="mt-2 text-sm text-muted-foreground">
          Tell us what went wrong. The page you&apos;re on is attached automatically.
        </DialogDescription>
      </div>
      <DialogClose
        aria-label="Close"
        className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] border border-border text-muted-foreground transition-colors hover:border-input hover:bg-popover hover:text-foreground"
      >
        <X className="size-4" />
      </DialogClose>
    </div>
  );
}

function ReportBugForm({ onDone }: { onDone: () => void }) {
  const pathname = usePathname();
  const [category, setCategory] = useState<BugCategory>("BUG");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (message.trim().length < BUG_MESSAGE_MIN) {
      setError(`Add a bit more detail (at least ${BUG_MESSAGE_MIN} characters)`);
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await fetch("/api/bug-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, message, pageUrl: pathname }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error ?? FALLBACK_ERROR);
      }
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : FALLBACK_ERROR);
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-5 px-6 pt-6 pb-6">
        <Header />
        <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-background/40 px-6 py-8 text-center">
          <CheckCircle2 className="size-8 text-primary" />
          <p className="mt-1 font-display text-lg font-black uppercase">Thanks for the report</p>
          <p className="text-sm text-muted-foreground">We read every one and will look into it.</p>
        </div>
        <div className="flex justify-end">
          <Button type="button" onClick={onDone}>
            Done
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit}>
      <div className="space-y-5 px-6 pt-6 pb-6">
        <Header />

        <div className="space-y-2">
          <span className="text-sm font-semibold">What kind of problem?</span>
          <div
            role="radiogroup"
            aria-label="Problem type"
            className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-background/40 p-1 sm:grid-cols-4"
          >
            {BUG_CATEGORIES.map((c) => {
              const selected = category === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setCategory(c.id)}
                  className={`h-9 cursor-pointer rounded-lg text-xs font-semibold transition-colors ${
                    selected
                      ? "bg-primary/[0.1] text-primary shadow-[inset_0_0_0_1px_var(--primary)]"
                      : "text-muted-foreground hover:bg-popover hover:text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-baseline justify-between gap-3">
            <label htmlFor="bug-message" className="text-sm font-semibold">
              What happened?
            </label>
            <span
              className={`font-mono text-xs ${message.length >= BUG_MESSAGE_MAX ? "text-accent" : "text-muted-foreground"}`}
            >
              {message.length} / {BUG_MESSAGE_MAX}
            </span>
          </div>
          <textarea
            id="bug-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={BUG_MESSAGE_MAX}
            rows={5}
            placeholder="What were you doing, what did you expect, and what happened instead?"
            className="w-full resize-none rounded-xl border border-border bg-background/60 px-4 py-3 text-[15px] leading-relaxed outline-none placeholder:text-muted-foreground/50 focus:border-primary/60 focus:ring-4 focus:ring-primary/10"
          />
          <p className="truncate font-mono text-[11px] text-muted-foreground">
            Page: <span className="text-electric">{pathname}</span>
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border bg-background/40 px-6 py-4">
        <span className="flex items-center gap-1.5 text-xs text-destructive">
          {error && (
            <>
              <AlertCircle className="size-3.5 shrink-0" /> {error}
            </>
          )}
        </span>
        <div className="flex shrink-0 gap-2">
          <DialogClose asChild>
            <Button type="button" variant="ghost">
              Cancel
            </Button>
          </DialogClose>
          <Button type="submit" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Bug />}
            Send report
          </Button>
        </div>
      </div>
    </form>
  );
}

export function ReportBugDialog() {
  const { open, setOpen } = useReportBug();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className={postDialogClass}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          document.getElementById("bug-message")?.focus();
        }}
      >
        {open && <ReportBugForm onDone={() => setOpen(false)} />}
      </DialogContent>
    </Dialog>
  );
}

export function ReportBugMenuItem() {
  const setOpen = useReportBug((s) => s.setOpen);

  return (
    <DropdownMenuItem onSelect={() => setOpen(true)} className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2">
      <Bug className="text-muted-foreground" /> Report a bug
    </DropdownMenuItem>
  );
}
