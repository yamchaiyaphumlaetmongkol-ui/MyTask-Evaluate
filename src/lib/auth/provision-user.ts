import {
  ADMIN_DEFAULT_PASSWORD,
  ADMIN_USERNAME,
  DEFAULT_USER_PASSWORD,
} from "@/lib/auth/constants";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

function resolveLoginUsername(
  clickupEmail: string | null | undefined,
  fallbackEmail: string,
): string | null {
  const email = clickupEmail?.trim() || fallbackEmail?.trim();
  if (!email || !email.includes("@")) return null;
  return email.toLowerCase();
}

/** Create or refresh auth row for an employee (username = ClickUp email). */
export async function ensureEmployeeAuthAccount(employeeId: bigint): Promise<void> {
  const employee = await prisma.pmEmployee.findUnique({
    where: { id: employeeId },
    select: {
      id: true,
      email: true,
      clickupEmail: true,
      active: true,
    },
  });
  if (!employee?.active) return;

  const username = resolveLoginUsername(employee.clickupEmail, employee.email);
  if (!username) return;

  const passwordHash = await hashPassword(DEFAULT_USER_PASSWORD);

  const existing = await prisma.appUserAuth.findFirst({
    where: {
      OR: [{ employeeId }, { username }],
    },
  });

  if (existing) {
    await prisma.appUserAuth.update({
      where: { id: existing.id },
      data: {
        username,
        employeeId,
      },
    });
    return;
  }

  await prisma.appUserAuth.create({
    data: {
      username,
      passwordHash,
      role: "user",
      mustChangePassword: true,
      employeeId,
    },
  });
}

/** Seed admin account if missing (username: admin). */
export async function ensureAdminAccount(): Promise<void> {
  const existing = await prisma.appUserAuth.findUnique({
    where: { username: ADMIN_USERNAME },
  });
  if (existing) return;

  const passwordHash = await hashPassword(ADMIN_DEFAULT_PASSWORD);
  await prisma.appUserAuth.create({
    data: {
      username: ADMIN_USERNAME,
      passwordHash,
      role: "admin",
      mustChangePassword: false,
      employeeId: null,
    },
  });
}

/** Backfill auth accounts for all active employees with email. */
export async function backfillEmployeeAuthAccounts(): Promise<void> {
  await ensureAdminAccount();

  const employees = await prisma.pmEmployee.findMany({
    where: { active: true },
    select: { id: true },
  });

  for (const e of employees) {
    await ensureEmployeeAuthAccount(e.id);
  }
}
