import { Ratelimit, type Duration } from "@upstash/ratelimit";
import type { Redis } from "@upstash/redis";
import { redis } from "@/lib/redis";

const LIMITS = {
  verifySummoner: { limit: 5, window: "60 s" },
  checkUsername: { limit: 30, window: "60 s" },
  friendRequest: { limit: 10, window: "60 s" },
  createPost: { limit: 5, window: "60 s" },
  bugReport: { limit: 3, window: "10 m" },
  sendMessage: { limit: 30, window: "60 s" },
} satisfies Record<string, { limit: number; window: Duration }>;

export type RateLimitName = keyof typeof LIMITS;
export type RateLimitResult = { ok: boolean; retryAfter: number };

if (!redis && process.env.NODE_ENV === "production") {
  console.warn("UPSTASH_REDIS_REST_URL/TOKEN missing: rate limits fall back to per-instance memory");
}

const upstashLimiters = new Map<RateLimitName, Ratelimit>();

function upstashLimiter(name: RateLimitName, client: Redis) {
  let limiter = upstashLimiters.get(name);
  if (!limiter) {
    const { limit, window } = LIMITS[name];
    limiter = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(limit, window),
      prefix: `duogg:rl:${name}`,
      ephemeralCache: new Map(),
      timeout: 1000,
    });
    upstashLimiters.set(name, limiter);
  }
  return limiter;
}

const memory = new Map<string, { count: number; resetAt: number }>();

function windowMs(window: Duration) {
  const [value, unit] = window.split(" ") as [string, string];
  const n = Number(value);
  const ms = { ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] ?? 1000;
  return n * ms;
}

function memoryLimit(name: RateLimitName, key: string): RateLimitResult {
  const { limit, window } = LIMITS[name];
  const id = `${name}:${key}`;
  const now = Date.now();
  const current = memory.get(id);

  if (!current || current.resetAt <= now) {
    memory.set(id, { count: 1, resetAt: now + windowMs(window) });
    if (memory.size > 10_000) {
      for (const [k, w] of memory) if (w.resetAt <= now) memory.delete(k);
    }
    return { ok: true, retryAfter: 0 };
  }
  if (current.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
  }
  current.count += 1;
  return { ok: true, retryAfter: 0 };
}

export async function rateLimit(name: RateLimitName, key: string): Promise<RateLimitResult> {
  if (!redis) return memoryLimit(name, key);

  try {
    const { success, reset, reason } = await upstashLimiter(name, redis).limit(key);
    if (reason === "timeout") {
      console.error(`Rate limiter "${name}" timed out, using memory fallback`);
      return memoryLimit(name, key);
    }
    return { ok: success, retryAfter: success ? 0 : Math.max(1, Math.ceil((reset - Date.now()) / 1000)) };
  } catch (error) {
    console.error(`Rate limiter "${name}" failed, using memory fallback:`, error);
    return memoryLimit(name, key);
  }
}
