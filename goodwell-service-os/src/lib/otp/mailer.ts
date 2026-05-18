import nodemailer from "nodemailer";
import { env } from "@/lib/env";

export type SendOtpEmailResult = { ok: true } | { ok: false; reason: string };

export async function sendOtpEmail(
  email: string,
  code: string,
): Promise<SendOtpEmailResult> {
  if (env.EMAIL_MOCK === "true") {
    // eslint-disable-next-line no-console
    console.log(`[DEV-EMAIL-OTP] email=${email} code=${code}`);
    return { ok: true };
  }

  try {
    const transport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT ?? 587),
      secure: Number(env.SMTP_PORT) === 465,
      auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
    });

    await transport.sendMail({
      from: env.EMAIL_FROM ?? env.SMTP_USER,
      to: email,
      subject: "Goodwell tasdiqlash kodi",
      text: `Tasdiqlash kodingiz: ${code}\n\nKod 5 daqiqa ichida amal qiladi.`,
      html: `<p>Tasdiqlash kodingiz: <strong>${code}</strong></p><p>Kod 5 daqiqa ichida amal qiladi.</p>`,
    });

    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : "unknown" };
  }
}
