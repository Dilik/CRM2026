import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { phoneNumber } from "better-auth/plugins/phone-number";
import { emailOTP } from "better-auth/plugins/email-otp";
import { prisma } from "@/lib/db";
import { env } from "@/lib/env";
import { sendOtpSms } from "@/lib/otp/eskiz";
import { sendOtpEmail } from "@/lib/otp/mailer";
import { checkAndConsumeOtpQuota } from "@/lib/otp/rate-limit";
import { normalizeUzbekPhone } from "@/lib/phone";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    disableSignUp: true, // staff accounts are created only by admin via Staff Management
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,  // 30 days
    updateAge: 60 * 60 * 24,       // refresh sliding window once per day
    cookieCache: { enabled: true, maxAge: 60 * 5 },
  },
  plugins: [
    emailOTP({
      sendVerificationOTP: async ({ email, otp }) => {
        const result = await sendOtpEmail(email, otp);
        if (!result.ok) {
          // eslint-disable-next-line no-console
          console.error("[EMAIL-OTP] send failed:", result.reason);
          throw new Error("OTP_SEND_FAILED");
        }
      },
      expiresIn: 60 * 5,
    }),
    phoneNumber({
      sendOTP: async ({ phoneNumber: rawPhone, code }) => {
        // Normalize early — the plugin does not enforce country
        const phone = normalizeUzbekPhone(rawPhone);

        // AUTH-05: server-side rate limit BEFORE sending (and BEFORE storing).
        // If denied, throw — better-auth will return an error to the client.
        const quota = await checkAndConsumeOtpQuota(phone);
        if (!quota.ok) {
          throw new Error(`RATE_LIMITED:${quota.reason}:${quota.retryAfterSec}`);
        }

        const result = await sendOtpSms(phone, code);
        if (!result.ok) {
          // D-06: surface only generic "smsFailed" to caller; reason stays in server logs
          // eslint-disable-next-line no-console
          console.error("[OTP] send failed:", result.reason);
          throw new Error("OTP_SEND_FAILED");
        }
      },
      // better-auth stores OTPs in the Verification table; we configure expiry and attempts.
      expiresIn: 60 * 5,           // 5 minutes
      allowedAttempts: 5,
    }),
  ],
  user: {
    additionalFields: {
      // bridge: better-auth's User has name/email; we add our role + language preference here
      role: { type: "string", required: false, defaultValue: "MASTER" },
      language: { type: "string", required: false, defaultValue: "uz_Latn" },
      active: { type: "boolean", required: false, defaultValue: true },
    },
  },
});
