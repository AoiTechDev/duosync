import Image from "next/image";

export function BrandLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/logo.svg"
        alt=""
        width={30}
        height={32}
        priority
        className="h-8 w-auto drop-shadow-[0_0_10px_color-mix(in_oklab,var(--accent)_45%,transparent)]"
      />
      <div className="font-display text-[20px] font-black uppercase tracking-[-0.01em]">
        Duo<span className="text-primary">GG</span>
      </div>
    </div>
  );
}
