import type { AuthUser } from "@/lib/auth/types";
import { resolveSessionUserId } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function getCurrentUser(): Promise<AuthUser | null> {
  const userId = await resolveSessionUserId();
  if (!userId) return null;

  const auth = await prisma.appUserAuth.findUnique({
    where: { id: userId },
    include: {
      employee: {
        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
          clickupUserId: true,
          clickupEmail: true,
          clickupProfileImage: true,
          email: true,
          active: true,
        },
      },
    },
  });

  if (!auth) return null;

  const employee = auth.employee?.active ? auth.employee : null;
  const loginEmail =
    employee?.clickupEmail?.trim().toLowerCase() ||
    auth.username.trim().toLowerCase();

  return {
    authId: String(auth.id),
    username: auth.username,
    role: auth.role,
    mustChangePassword: auth.mustChangePassword,
    employeeId: employee ? String(employee.id) : null,
    employeeCode: employee?.employeeCode ?? null,
    employeeName: employee
      ? `${employee.firstName} ${employee.lastName}`.trim()
      : null,
    clickupUserId: employee?.clickupUserId ?? null,
    clickupEmail: employee?.clickupEmail ?? null,
    profileImage: employee?.clickupProfileImage ?? null,
    loginEmail,
    isAdmin: auth.role === "admin",
  };
}

export async function requireCurrentUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("NOT_AUTHENTICATED");
  return user;
}
