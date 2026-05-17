"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { formatUzbekPhoneMask, normalizeUzbekPhone, isValidUzbekPhone } from "@/lib/phone";

export function PhoneForm({ onOtpSent }: { onOtpSent: (phone: string) => void }) {
  const t = useTranslations("auth");
  const [digits, setDigits] = useState("");
  const [loading, setLoading] = useState(false);

  const display = formatUzbekPhoneMask(digits);
  const canSubmit = digits.length === 9 && isValidUzbekPhone(`+998${digits}`);

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    // strip everything that isn't a digit, drop the leading 998 if user pasted full number
    const all = e.target.value.replace(/\D/g, "");
    const tail = all.startsWith("998") ? all.slice(3) : all;
    setDigits(tail.slice(0, 9));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;
    setLoading(true);
    try {
      const normalized = normalizeUzbekPhone(`+998${digits}`);
      const res = await authClient.phoneNumber.sendOtp({ phoneNumber: `+${normalized}` });
      if (res.error) {
        // D-06: always show generic message; never expose the raw error
        toast.error(t("login.error.smsFailed"));
        return;
      }
      onOtpSent(normalized);
    } catch {
      toast.error(t("login.error.generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium">{t("login.phoneLabel")}</span>
        <input
          inputMode="numeric"
          autoComplete="tel"
          value={display}
          onChange={onChange}
          placeholder={t("login.phonePlaceholder")}
          className="mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </label>
      <button
        type="submit"
        disabled={!canSubmit || loading}
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {t("login.continue")}
      </button>
    </form>
  );
}
