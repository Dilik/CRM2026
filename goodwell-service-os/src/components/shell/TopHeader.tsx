import { Separator } from "@/components/ui/separator";
import { UserProfileMenu } from "./UserProfileMenu";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { MobileNavDrawer } from "./MobileNavDrawer";
import type { UserRole } from "@prisma/client";
import type { Locale } from "@/i18n/locales";
import type { NavItem } from "./nav-items";

type Props = {
  name: string;
  role: UserRole;
  locale: Locale;
  navItems: NavItem[];
};

export function TopHeader({ name, role, locale, navItems }: Props) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-zinc-200 bg-white px-4 dark:border-zinc-700 dark:bg-zinc-900">
      <MobileNavDrawer items={navItems} />

      {/* Logo on mobile */}
      <span className="font-semibold text-sm md:hidden">Goodwell</span>

      <div className="flex-1" />

      <LanguageSwitcher currentLocale={locale} />
      <Separator orientation="vertical" className="h-6" />
      <UserProfileMenu name={name} role={role} />
    </header>
  );
}
