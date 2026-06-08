import { fail, type ActionResult } from "@/api/_shared/action-result";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function getCurrentLoginEmailOrThrow(): Promise<string> {
  const actor = await getCurrentIdentityActor();
  if (!actor.binding && !actor.isAdmin) {
    throw new Error("USER_NOT_AUTHENTICATED");
  }
  return actor.loginEmail;
}

export type IdentityActor = {
  loginEmail: string;
  isAdmin: boolean;
  binding: {
    id: string;
    employeeId: string;
    employeeCode: string | null;
    roleCode: string | null;
    positionCode: string | null;
    employeeName: string;
    clickupUserId: string | null;
    clickupEmail: string | null;
  } | null;
};

export async function getCurrentIdentityActor(): Promise<IdentityActor> {
  const user = await getCurrentUser();
  if (!user) {
    return { loginEmail: "", isAdmin: false, binding: null };
  }

  if (!user.employeeId) {
    return {
      loginEmail: user.loginEmail,
      isAdmin: user.isAdmin,
      binding: null,
    };
  }

  const { prisma } = await import("@/lib/prisma");
  const employee = await prisma.pmEmployee.findUnique({
    where: { id: BigInt(user.employeeId) },
    select: {
      id: true,
      employeeCode: true,
      roleCode: true,
      positionCode: true,
      firstName: true,
      lastName: true,
      clickupUserId: true,
      clickupEmail: true,
      active: true,
    },
  });

  if (!employee?.active) {
    return {
      loginEmail: user.loginEmail,
      isAdmin: user.isAdmin,
      binding: null,
    };
  }

  return {
    loginEmail: user.loginEmail,
    isAdmin: user.isAdmin,
    binding: {
      id: String(employee.id),
      employeeId: String(employee.id),
      employeeCode: employee.employeeCode,
      roleCode: employee.roleCode,
      positionCode: employee.positionCode,
      employeeName: `${employee.firstName} ${employee.lastName}`.trim(),
      clickupUserId: employee.clickupUserId,
      clickupEmail: employee.clickupEmail,
    },
  };
}

export function mapIdentityError(e: unknown): ActionResult<never> {
  if (e instanceof Error && e.message === "USER_NOT_AUTHENTICATED") {
    return fail("กรุณาเข้าสู่ระบบ");
  }
  if (e instanceof Error && e.message === "NOT_AUTHENTICATED") {
    return fail("กรุณาเข้าสู่ระบบ");
  }
  return fail("เกิดข้อผิดพลาดในการตรวจสอบตัวตน");
}
