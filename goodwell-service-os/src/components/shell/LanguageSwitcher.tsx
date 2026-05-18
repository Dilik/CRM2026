"use client";

import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { locales, localeLabels, type Locale } from "@/i18n/locales";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const t = useTranslations("shell.profile");
  const router = useRouter();
  const pathname = usePathname();

  function switchLocale(locale: Locale) {
    router.replace(pathname, { locale });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("language")} className="h-8 w-8">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => switchLocale(locale)}
            className={locale === currentLocale ? "font-semibold" : ""}
          >
            {localeLabels[locale]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
