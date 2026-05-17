import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/${locale}/login`);

  return (
    <main className="max-w-2xl mx-auto p-8 space-y-4">
      <h1 className="text-3xl font-semibold">Dashboard</h1>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Phase 1 / Plan 03 stub. Plan 04 ships the real app shell + Plan 05 ships RBAC.
      </p>
      <pre className="rounded bg-zinc-100 dark:bg-zinc-900 p-4 text-xs overflow-auto">
        {JSON.stringify(
          { userId: session.user.id, name: session.user.name },
          null,
          2,
        )}
      </pre>
    </main>
  );
}
