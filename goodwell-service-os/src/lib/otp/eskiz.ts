import { env } from "@/lib/env";

export type SendOtpResult = { ok: true } | { ok: false; reason: string };

/**
 * In dev (ESKIZ_MOCK=true), this logs the code to the server console and returns ok.
 * In production, posts to Eskiz.uz SMS API.
 *
 * Callers MUST NOT show the underlying reason to the end user (D-06: generic message).
 */
export async function sendOtpSms(phone: string, code: string): Promise<SendOtpResult> {
  if (env.ESKIZ_MOCK === "true") {
    // eslint-disable-next-line no-console
    console.log(`[DEV-OTP] phone=${phone} code=${code}`);
    return { ok: true };
  }

  // Production: Eskiz token-based send.
  // NOTE: full Eskiz integration (token caching, template approval) is implemented in Phase 7.
  // For Phase 1 production we ship a basic single-shot login flow — Eskiz integration treated
  // here as a thin wrapper that the Phase 7 hardening replaces.
  try {
    const loginRes = await fetch("https://notify.eskiz.uz/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: env.ESKIZ_EMAIL, password: env.ESKIZ_PASSWORD }),
    });
    if (!loginRes.ok) return { ok: false, reason: "eskiz_login_failed" };
    const { data } = await loginRes.json() as { data: { token: string } };

    const sendRes = await fetch("https://notify.eskiz.uz/api/message/sms/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${data.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mobile_phone: phone,
        message: `Goodwell tasdiqlash kodi: ${code}`,
        from: env.ESKIZ_FROM ?? "4546",
      }),
    });
    return sendRes.ok ? { ok: true } : { ok: false, reason: "eskiz_send_failed" };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "unknown" };
  }
}
