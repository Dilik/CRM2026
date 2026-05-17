import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import type { PrismaClient, UserRole, LocaleCode } from "@prisma/client";

export type Context = {
  prisma: PrismaClient;
  req: Request;
  session: { id: string; userId: string; expiresAt: Date } | null;
  user: {
    id: string;
    phone: string;
    name: string;
    role: UserRole;
    language: LocaleCode;
    active: boolean;
  } | null;
};

export async function createTRPCContext(opts: { req: Request }): Promise<Context> {
  const session = await auth.api.getSession({ headers: opts.req.headers });

  return {
    prisma,
    req: opts.req,
    session: session
      ? { id: session.session.id, userId: session.session.userId, expiresAt: session.session.expiresAt }
      : null,
    user: session
      ? {
          id: session.user.id,
          phone: (session.user as { phoneNumber?: string }).phoneNumber ?? "",
          name: session.user.name,
          role: (session.user as { role?: UserRole }).role ?? "MASTER",
          language: (session.user as { language?: LocaleCode }).language ?? "uz_Latn",
          active: (session.user as { active?: boolean }).active ?? true,
        }
      : null,
  };
}
