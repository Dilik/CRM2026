import { prisma } from "@/lib/db";

const WINDOWS = {
  perMinute: { seconds: 60, max: 1, key: "60s" },
  perHour:   { seconds: 60 * 60, max: 5, key: "1h" },
  perDay:    { seconds: 60 * 60 * 24, max: 10, key: "1d" },
} as const;

function windowKey(prefix: string, seconds: number, now: Date): string {
  const bucket = Math.floor(now.getTime() / 1000 / seconds);
  return `${prefix}:${bucket}`;
}

export type QuotaResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number; reason: "perMinute" | "perHour" | "perDay" };

/**
 * Atomically checks all three windows and increments counters if all pass.
 * Returns { ok: false, retryAfterSec } when any limit is exceeded.
 */
export async function checkAndConsumeOtpQuota(phone: string, now: Date = new Date()): Promise<QuotaResult> {
  const checks = [
    { name: "perMinute" as const, ...WINDOWS.perMinute },
    { name: "perHour" as const,   ...WINDOWS.perHour },
    { name: "perDay" as const,    ...WINDOWS.perDay },
  ];

  return prisma.$transaction(async (tx) => {
    // First pass: read current counts, decide if any limit is breached
    for (const w of checks) {
      const key = windowKey(w.key, w.seconds, now);
      const row = await tx.otpRateLimit.findUnique({
        where: { phone_windowKey: { phone, windowKey: key } },
      });
      const current = row?.count ?? 0;
      if (current >= w.max) {
        const expiresAt = row?.expiresAt ?? new Date(now.getTime() + w.seconds * 1000);
        const retryAfterSec = Math.max(1, Math.ceil((expiresAt.getTime() - now.getTime()) / 1000));
        return { ok: false as const, retryAfterSec, reason: w.name };
      }
    }
    // Second pass: increment all counters atomically (we already hold the tx)
    for (const w of checks) {
      const key = windowKey(w.key, w.seconds, now);
      const expiresAt = new Date(now.getTime() + w.seconds * 1000);
      await tx.otpRateLimit.upsert({
        where: { phone_windowKey: { phone, windowKey: key } },
        create: { phone, windowKey: key, count: 1, expiresAt },
        update: { count: { increment: 1 } },
      });
    }
    return { ok: true as const };
  });
}
