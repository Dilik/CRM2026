"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export function EmailForm({ onOtpSent }: { onOtpSent: (email: string) => void }) {
  const t = useTranslations("auth");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value.trim());
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid || loading) return;
    if (!isValid) {
      toast.error(t("login.error.invalidEmail"));
      return;
    }
    setLoading(true);
    try {
      const res = await authClient.emailOtp.sendVerificationOtp({
        email,
        type: "sign-in",
      });
      if (res.error) {
        toast.error(t("login.error.emailFailed"));
        return;
      }
      onOtpSent(email);
    } catch {
      toast.error(t("login.error.generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">{t("login.emailLabel")}</span>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={onChange}
          placeholder={t("login.emailPlaceholder")}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      <button
        type="submit"
        disabled={!isValid || loading}
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {t("login.continue")}
      </button>
    </form>
  );
}
