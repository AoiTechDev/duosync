import { isOnline } from "@/lib/post-lifecycle";

export function OnlineDot({
  lastSeenAt,
  now,
  className = "",
}: {
  lastSeenAt: Date | string | null | undefined;
  now?: number;
  className?: string;
}) {
  if (!isOnline(lastSeenAt, now)) return null;
  return (
    <span
      role="img"
      aria-label="Online now"
      title="Online now"
      className={`absolute rounded-full border-2 border-card bg-success shadow-[0_0_8px_var(--success)] ${className}`}
    />
  );
}
