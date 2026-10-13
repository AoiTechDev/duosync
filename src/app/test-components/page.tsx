import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";

const variants = [
  { variant: "default", label: "Primary · gold, notched", text: "Send request" },
  { variant: "secondary", label: "Secondary · electric", text: "View profile" },
  { variant: "ghost", label: "Ghost", text: "Cancel" },
  { variant: "destructive", label: "Destructive", text: "Delete post" },
  { variant: "discord", label: "Discord · #5865F2", text: "Continue with Discord" },
] as const;

const states = [
  { name: "Default", props: {} },
  { name: "Hover", props: { "data-force": "hover" } },
  { name: "Pressed", props: { "data-force": "active" } },
  { name: "Disabled", props: { disabled: true } },
] as const;

export default function TestComponentsPage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <main className="min-h-screen p-6 md:p-16">
      <section className="overflow-x-auto rounded-2xl border border-border bg-card p-8">
        <div className="grid min-w-[960px] grid-cols-[200px_repeat(4,1fr)] items-center gap-x-6 gap-y-7">
          <div />
          {states.map((s) => (
            <div
              key={s.name}
              className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              {s.name}
            </div>
          ))}

          {variants.map((v) => (
            <div key={v.variant} className="contents">
              <div className="text-sm font-semibold text-foreground/80">{v.label}</div>
              {states.map((s) => (
                <div key={s.name}>
                  <Button variant={v.variant} {...s.props}>
                    {v.text}
                  </Button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <p className="mt-6 text-sm text-muted-foreground">
        Hover and Pressed columns are forced with <code className="font-mono">data-force</code>.
        Buttons in the Default column react to real hover and click.
      </p>
    </main>
  );
}
