import { fail, type ActionResult } from "@/api/_shared/action-result";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export async function getCurrentLoginEmailOrThrow(): Promise<string> {
  const actor = await getCurrentIdentityActor();
  if (!actor.binding) {
    throw new Error("USER_NOT_SELECTED");
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
  const cookieStore = await cookies();
  const selectedEmployeeId = cookieStore.get("erp_selected_employee_id")?.value ?? "";
  if (!selectedEmployeeId) {
    return { loginEmail: "", isAdmin: false, binding: null };
  }

  const employee = await prisma.pmEmployee.findUnique({
    where: { id: BigInt(selectedEmployeeId) },
    select: {
      id: true,
      employeeCode: true,
      roleCode: true,
      positionCode: true,
      firstName: true,
      lastName: true,
      clickupUserId: true,
      clickupEmail: true,
      email: true,
      active: true,
    },
  });
  if (!employee?.active) {
    return { loginEmail: "", isAdmin: false, binding: null };
  }

  const normalizedEmail = employee.email?.trim().toLowerCase() ?? "";
  return {
    loginEmail: normalizedEmail,
    isAdmin: false,
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
  if (e instanceof Error && e.message === "USER_NOT_SELECTED") {
    return fail("กรุณาเลือกผู้ใช้งาน");
  }
  return fail("เกิดข้อผิดพลาดในการตรวจสอบตัวตน");
}
