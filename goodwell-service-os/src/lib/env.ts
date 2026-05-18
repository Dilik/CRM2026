import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  ESKIZ_EMAIL: z.string().email().optional().or(z.literal("")),
  ESKIZ_PASSWORD: z.string().optional(),
  ESKIZ_FROM: z.string().optional(),
  ESKIZ_MOCK: z.enum(["true", "false"]).default("true"),
  EMAIL_MOCK: z.enum(["true", "false"]).default("true"),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const env = envSchema.parse(process.env);
