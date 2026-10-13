export function RegionCode({ code, className = "" }: { code: string; className?: string }) {
  return (
    <span className={`relative top-[0.5px] font-mono text-[10px] leading-none font-bold text-electric ${className}`}>
      {code}
    </span>
  );
}
