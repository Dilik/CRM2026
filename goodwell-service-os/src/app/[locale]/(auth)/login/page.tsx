import { LoginFlow } from "./LoginFlow";
import type { Locale } from "@/i18n/locales";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <LoginFlow locale={locale as Locale} />;
}
