import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { Sidebar } from "@/components/shell/Sidebar";
import { TopHeader } from "@/components/shell/TopHeader";
import { navItemsForRole } from "@/components/shell/nav-items";
import type { Locale } from "@/i18n/locales";
import type { UserRole } from "@prisma/client";

export default async function AppShellLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  if (!session) {
    redirect(`/${locale}/login`);
  }

  const user = session.user as typeof session.user & {
    role?: UserRole;
    name?: string;
  };

  const role: UserRole = user.role ?? "MASTER";
  const name = user.name ?? "";
  const navItems = navItemsForRole(role);

  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <Sidebar items={navItems} />
      <div className="flex flex-1 flex-col min-w-0">
        <TopHeader
          name={name}
          role={role}
          locale={locale as Locale}
          navItems={navItems}
        />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
