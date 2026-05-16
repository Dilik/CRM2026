import "dotenv/config";
import { defineConfig } from "@prisma/config";

// Prisma 7 moved `datasource.url` out of schema.prisma.
// CLI commands (db push, migrate, studio) read connection details from here.
// Runtime `PrismaClient` receives a driver adapter (see src/lib/db.ts).
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
