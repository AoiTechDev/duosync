import type { Metadata } from "next";
import { AuthButtons } from "@/components/auth/AuthButtons";
import EmblemField from "./EmblemField";

export const metadata: Metadata = {
  title: "Sign in · DuoSync",
  description: "Find your League of Legends duo. Match by rank, role and playstyle.",
};

const FEATURES = [
  { n: "01", title: "Role synergy", text: "Match on main and secondary role." },
  { n: "02", title: "Rank filters", text: "Only see duos inside your range." },
  { n: "03", title: "Voice-ready", text: "Filter by how players like to talk." },
];

const LoginPage = () => {
  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-background">
      {/* Backdrop: grid, ambient glows, diagonal light streak */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--foreground)_4%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--foreground)_4%,transparent)_1px,transparent_1px)] bg-size-[72px_72px] mask-[radial-gradient(ellipse_at_70%_40%,black_20%,transparent_75%)]" />
        <div className="absolute -top-40 right-[-10%] size-[900px] rounded-full bg-glow/20 blur-[160px]" />
        <div className="absolute -bottom-60 -left-40 size-[620px] rounded-full bg-accent/12 blur-[150px]" />
        <div className="absolute -top-1/4 left-[58%] h-[160%] w-[260px] rotate-[24deg] bg-linear-to-b from-primary/12 via-primary/5 to-transparent blur-[2px]" />
      </div>

      <EmblemField />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-[clamp(20px,5vw,80px)] pt-10 pb-14">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex size-8 items-center justify-center rounded-full bg-linear-to-br from-primary to-accent shadow-[0_0_16px_color-mix(in_oklab,var(--accent)_55%,transparent)]">
            <div className="flex size-[22px] items-center justify-center rounded-full bg-background font-display text-[11px] font-black text-primary">
              D
            </div>
          </div>
          <div className="font-display text-[20px] font-black uppercase tracking-[-0.01em]">
            Duo<span className="text-primary">sync</span>
          </div>
        </div>

        {/* Hero */}
        <section className="flex max-w-[840px] flex-1 flex-col justify-center gap-7 py-10">
          <div className="flex items-center gap-2.5 font-mono text-xs uppercase tracking-[0.14em] text-foreground/80">
            <span className="h-0.5 w-7 bg-primary" />
            League of Legends duo finder
          </div>

          <h1 className="m-0 font-display text-[clamp(42px,7.4vw,112px)] font-black uppercase leading-[0.92] tracking-[-0.03em]">
            Find your duo.{" "}
            <span className="block bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
              Climb together.
            </span>
          </h1>

          <p className="max-w-[520px] text-[clamp(17px,1.6vw,20px)] leading-normal text-foreground/80">
            Link your Riot ID, set your roles and rank, and match with players who want the same
            climb.
          </p>

          <div className="w-full max-w-[360px] space-y-4">
            <AuthButtons />
            <p className="text-xs text-muted-foreground">
              By continuing you agree to the{" "}
              <span className="text-electric underline underline-offset-2">Terms</span> and{" "}
              <span className="text-electric underline underline-offset-2">Privacy Policy</span>.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="grid max-w-[860px] grid-cols-1 border-t border-border sm:grid-cols-3">
          {FEATURES.map((f, i) => (
            <div
              key={f.n}
              className={`space-y-1.5 pt-6 pb-2 sm:pr-6 ${i > 0 ? "sm:border-l sm:border-border sm:pl-6" : ""}`}
            >
              <div className="font-mono text-xs text-primary">{f.n}</div>
              <div className="font-display text-[20px] font-black uppercase tracking-[-0.02em]">
                {f.title}
              </div>
              <p className="text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
};

export default LoginPage;
