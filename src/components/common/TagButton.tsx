import Image from "next/image";

export function TagButton({
  selected,
  disabled = false,
  onClick,
  icon,
  label,
}: {
  selected: boolean;
  disabled?: boolean;
  onClick: () => void;
  icon?: string;
  label: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      className={`inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-35 ${
        selected
          ? "border-primary bg-primary/[0.07] text-primary shadow-[0_0_14px_color-mix(in_oklab,var(--primary)_25%,transparent)]"
          : "border-border bg-card/70 text-foreground/90 enabled:hover:border-input enabled:hover:bg-popover"
      }`}
    >
      {icon && <Image src={icon} alt="" width={18} height={18} />}
      <span>{label}</span>
    </button>
  );
}
