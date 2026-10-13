export function BrandLogo() {
  return (
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
  );
}
