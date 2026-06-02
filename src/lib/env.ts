import { z } from "zod";

function pickFirstNonEmpty(...values: Array<string | undefined>) {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value;
    }
  }
  return undefined;
}

const EnvSchema = z.object({
  AUTH_SECRET: z.string().min(1, "AUTH_SECRET (or NEXTAUTH_SECRET) is required"),
  AUTH_KEYCLOAK_ID: z.string().min(1, "AUTH_KEYCLOAK_ID is required"),
  AUTH_KEYCLOAK_SECRET: z.string().min(1, "AUTH_KEYCLOAK_SECRET is required"),
  AUTH_KEYCLOAK_ISSUER: z.string().url("AUTH_KEYCLOAK_ISSUER must be a valid URL"),
});

const parsed = EnvSchema.safeParse({
  AUTH_SECRET: pickFirstNonEmpty(
    process.env.AUTH_SECRET,
    process.env.NEXTAUTH_SECRET,
  ),
  AUTH_KEYCLOAK_ID: process.env.AUTH_KEYCLOAK_ID,
  AUTH_KEYCLOAK_SECRET: process.env.AUTH_KEYCLOAK_SECRET,
  AUTH_KEYCLOAK_ISSUER: process.env.AUTH_KEYCLOAK_ISSUER,
});

if (!parsed.success) {
  throw new Error(
    `Invalid auth environment variables: ${parsed.error.issues
      .map((i) => i.message)
      .join(", ")}`,
  );
}

export const env = parsed.data;
