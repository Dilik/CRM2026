"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { PhoneForm } from "./PhoneForm";
import { OtpForm } from "./OtpForm";
import { Toaster } from "sonner";

type Stage = { kind: "phone" } | { kind: "otp"; phone: string };

export function LoginFlow() {
  const t = useTranslations("auth");
  const [stage, setStage] = useState<Stage>({ kind: "phone" });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-center">{t("login.title")}</h1>
      {stage.kind === "phone" ? (
        <PhoneForm onOtpSent={(phone) => setStage({ kind: "otp", phone })} />
      ) : (
        <OtpForm phone={stage.phone} onBack={() => setStage({ kind: "phone" })} />
      )}
      <Toaster position="top-center" richColors />
    </div>
  );
}
