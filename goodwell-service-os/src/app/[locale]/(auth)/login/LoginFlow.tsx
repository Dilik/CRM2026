"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PhoneForm } from "./PhoneForm";
import { OtpForm } from "./OtpForm";
import { EmailForm } from "./EmailForm";
import { EmailOtpForm } from "./EmailOtpForm";
import { PasswordForm } from "./PasswordForm";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { Toaster } from "sonner";
import type { Locale } from "@/i18n/locales";

type Method = "phone" | "email" | "password";
type Stage =
  | { kind: "phone" }
  | { kind: "phoneOtp"; phone: string }
  | { kind: "email" }
  | { kind: "emailOtp"; email: string }
  | { kind: "password" };

const METHOD_STAGE: Record<Method, Stage> = {
  phone: { kind: "phone" },
  email: { kind: "email" },
  password: { kind: "password" },
};

export function LoginFlow({ locale }: { locale: Locale }) {
  const t = useTranslations("auth");
  const [method, setMethod] = useState<Method>("phone");
  const [stage, setStage] = useState<Stage>({ kind: "phone" });

  function switchMethod(m: Method) {
    setMethod(m);
    setStage(METHOD_STAGE[m]);
  }

  const showTabs =
    stage.kind === "phone" || stage.kind === "email" || stage.kind === "password";

  const tabLabel: Record<Method, string> = {
    phone: t("login.phoneTab"),
    email: t("login.emailTab"),
    password: t("login.passwordTab"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{t("login.title")}</h1>
        <LanguageSwitcher currentLocale={locale} />
      </div>

      {showTabs && (
        <div className="flex rounded-lg border border-zinc-200 dark:border-zinc-700 p-1 gap-1">
          {(["phone", "email", "password"] as Method[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMethod(m)}
              className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors ${
                method === m
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
              }`}
            >
              {tabLabel[m]}
            </button>
          ))}
        </div>
      )}

      {stage.kind === "phone" && (
        <PhoneForm onOtpSent={(phone) => setStage({ kind: "phoneOtp", phone })} />
      )}
      {stage.kind === "phoneOtp" && (
        <OtpForm phone={stage.phone} onBack={() => setStage({ kind: "phone" })} />
      )}
      {stage.kind === "email" && (
        <EmailForm onOtpSent={(email) => setStage({ kind: "emailOtp", email })} />
      )}
      {stage.kind === "emailOtp" && (
        <EmailOtpForm email={stage.email} onBack={() => setStage({ kind: "email" })} />
      )}
      {stage.kind === "password" && <PasswordForm />}

      <Toaster position="top-center" richColors />
    </div>
  );
}
