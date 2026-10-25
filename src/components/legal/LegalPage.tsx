import Link from "next/link";
import type { ReactNode } from "react";
import { BrandLogo } from "@/components/BrandLogo";
import { LEGAL_UPDATED, SITE_NAME } from "@/lib/site";

export function LegalPage({ title, intro, children }: { title: string; intro: ReactNode; children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-[760px] px-5 pt-10 pb-20">
        <Link href="/" aria-label={`${SITE_NAME} home`}>
          <BrandLogo />
        </Link>
        <header className="mt-12 border-b border-border pb-8">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Last updated {LEGAL_UPDATED}
          </div>
          <h1 className="mt-3 font-display text-[clamp(34px,6vw,56px)] font-black uppercase leading-[0.95] tracking-[-0.03em]">
            {title}
          </h1>
          <div className="mt-5 text-[15px] leading-relaxed text-foreground/80">{intro}</div>
        </header>
        <div className="space-y-10 pt-8">{children}</div>
        <footer className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-border pt-6 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <Link href="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
        </footer>
      </div>
    </main>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-[18px] font-black uppercase tracking-[-0.01em]">{title}</h2>
      <div className="space-y-3 text-[15px] leading-relaxed text-foreground/85 [&_a]:text-electric [&_a]:underline [&_a]:underline-offset-2 [&_li]:pl-1 [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}
