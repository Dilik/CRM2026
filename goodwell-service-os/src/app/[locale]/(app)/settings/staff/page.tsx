import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import type { UserRole } from "@prisma/client";
import { StaffTable } from "./StaffTable";

export default async function StaffManagementPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) redirect(`/${locale}/login`);
  const role = (session.user as typeof session.user & { role?: UserRole }).role;
  if (role !== "ADMIN") redirect(`/${locale}/dashboard`);

  return <StaffTable />;
}
