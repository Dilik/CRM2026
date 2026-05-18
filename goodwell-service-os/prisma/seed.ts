import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "better-auth/crypto";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function createUserWithPassword(
  data: { email: string; name: string; role: "ADMIN" | "RECEPTIONIST" | "MASTER" | "WAREHOUSE" | "EXECUTIVE" },
  password: string,
) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    console.log(`Already exists: ${data.email}`);
    return existing;
  }

  const user = await prisma.user.create({
    data: {
      email: data.email,
      emailVerified: true,
      name: data.name,
      role: data.role,
      active: true,
    },
  });

  await prisma.account.create({
    data: {
      userId: user.id,
      providerId: "credential",
      accountId: user.id,
      password: await hashPassword(password),
    },
  });

  console.log(`Created ${data.role}: ${data.email}`);
  return user;
}

async function main() {
  // Phone-based admin (original seed)
  const phoneAdmin = await prisma.user.findFirst({ where: { role: "ADMIN", phone: "998901234567" } });
  if (!phoneAdmin) {
    await prisma.user.create({
      data: {
        phone: "998901234567",
        name: "Admin",
        role: "ADMIN",
        active: true,
        phoneVerified: true,
      },
    });
    console.log("Seeded phone admin: 998901234567");
  } else {
    console.log("Phone admin already exists:", phoneAdmin.phone);
  }

  // Test users with email + password
  await createUserWithPassword(
    { email: "admin111@goodwellcrm.uz", name: "Admin111", role: "ADMIN" },
    "admin111@2026",
  );

  await createUserWithPassword(
    { email: "user1@goodwellcrm.uz", name: "User1", role: "RECEPTIONIST" },
    "user@2026",
  );
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
