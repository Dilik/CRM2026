"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { OTPInput, type SlotProps } from "input-otp";
import { useRouter } from "@/i18n/navigation";
import { authClient } from "@/lib/auth-client";

const RESEND_SECONDS = 60;

export function OtpForm({ phone, onBack }: { phone: string; onBack: () => void }) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [seconds, setSeconds] = useState(RESEND_SECONDS);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [seconds]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (code.length !== 6 || submitting) return;
    setSubmitting(true);
    try {
      const res = await authClient.phoneNumber.verify({ phoneNumber: `+${phone}`, code });
      if (res.error) {
        toast.error(t("otp.error.invalid"));
        setCode("");
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      toast.error(t("login.error.generic"));
    } finally {
      setSubmitting(false);
    }
  }

  async function onResend() {
    if (seconds > 0) return;
    try {
      const res = await authClient.phoneNumber.sendOtp({ phoneNumber: `+${phone}` });
      if (res.error) toast.error(t("login.error.smsFailed"));
      else setSeconds(RESEND_SECONDS);
    } catch {
      toast.error(t("login.error.generic"));
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold">{t("otp.title")}</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{t("otp.subtitle")}</p>
        <p className="text-sm font-mono mt-2">+{phone}</p>
      </div>

      <OTPInput
        value={code}
        onChange={setCode}
        maxLength={6}
        containerClassName="flex gap-2 justify-center"
        render={({ slots }) => (
          <>
            {slots.map((slot, i) => <Slot key={i} {...slot} />)}
          </>
        )}
      />

      <button
        type="submit"
        disabled={code.length !== 6 || submitting}
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {t("otp.verify")}
      </button>

      <button
        type="button"
        onClick={onResend}
        disabled={seconds > 0}
        className="w-full text-sm text-zinc-600 dark:text-zinc-400 disabled:opacity-50"
      >
        {seconds > 0 ? t("otp.resendIn", { seconds }) : t("otp.resend")}
      </button>

      <button
        type="button"
        onClick={onBack}
        className="w-full text-xs text-zinc-500"
      >
        ← {t("login.phoneLabel")}
      </button>
    </form>
  );
}

function Slot(props: SlotProps) {
  return (
    <div
      className={`w-10 h-12 border rounded-md flex items-center justify-center text-lg font-mono ${
        props.isActive ? "border-zinc-900 ring-1 ring-zinc-900 dark:border-zinc-100 dark:ring-zinc-100" : "border-zinc-300 dark:border-zinc-700"
      }`}
    >
      {props.char ?? (props.hasFakeCaret ? <span className="w-px h-6 bg-zinc-900 dark:bg-zinc-100 animate-pulse" /> : null)}
    </div>
  );
}
