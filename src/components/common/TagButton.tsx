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
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      className={`
          inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium transition-all cursor-pointer
          ${
            selected
              ? "bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20"
              : disabled
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:shadow-sm"
          }
        `}
    >
      {icon && <Image src={icon} alt={label} width={20} height={20} />}
      <span>{label}</span>
    </button>
  );
}
