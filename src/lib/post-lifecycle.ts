export const POST_TTL_MS = 2 * 60 * 60 * 1000;
export const BUMP_COOLDOWN_MS = 30 * 60 * 1000;
export const ONLINE_WINDOW_MS = 5 * 60 * 1000;
export const HEARTBEAT_MS = 60 * 1000;

const toTime = (d: Date | string | null | undefined) => (d ? new Date(d).getTime() : 0);

export function isExpired(expiresAt: Date | string, now = Date.now()) {
  return toTime(expiresAt) <= now;
}

export function bumpAvailableAt(bumpedAt: Date | string) {
  return toTime(bumpedAt) + BUMP_COOLDOWN_MS;
}

export function isOnline(lastSeenAt: Date | string | null | undefined, now = Date.now()) {
  return now - toTime(lastSeenAt) < ONLINE_WINDOW_MS;
}

export function formatDuration(ms: number) {
  const minutes = Math.max(1, Math.ceil(ms / 60000));
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}
