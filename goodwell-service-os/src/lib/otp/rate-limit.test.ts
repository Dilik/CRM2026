import { describe, it, expect } from "vitest";
import { checkAndConsumeOtpQuota } from "./rate-limit";

// Integration-style: relies on the dev Postgres. Mark skipped if DATABASE_URL points to a missing DB.
describe.skipIf(!process.env.DATABASE_URL)("checkAndConsumeOtpQuota", () => {
  const phone = `998900000${Math.floor(Math.random() * 999).toString().padStart(3, "0")}`;
  it("allows the first request", async () => {
    const res = await checkAndConsumeOtpQuota(phone);
    expect(res.ok).toBe(true);
  });
  it("rejects the second request within 60s (perMinute=1)", async () => {
    const res = await checkAndConsumeOtpQuota(phone);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.reason).toBe("perMinute");
      expect(res.retryAfterSec).toBeGreaterThan(0);
    }
  });
});
