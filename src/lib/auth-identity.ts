import { fail, type ActionResult } from "@/api/_shared/action-result";
import { isAdminEmail } from "@/lib/app-config";
import { prisma } from "@/lib/prisma";
import { auth } from "@/server/auth";

export async function getCurrentLoginEmailOrThrow(): Promise<string> {
  const session = await auth();
  const email = session?.user?.email?.trim().toLowerCase();
  if (!email) {
    throw new Error("UNAUTHENTICATED");
  }
  return email;
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

function getIdentityBindingDelegate() {
  const binding = (prisma as unknown as { userIdentityBinding?: unknown })
    .userIdentityBinding as
    | {
        findUnique: (args: {
          where: { loginEmail: string };
          include: { employee: true };
        }) => Promise<
          | {
              id: bigint;
              employeeId: bigint;
              employee: {
                employeeCode: string | null;
                roleCode: string | null;
                positionCode: string | null;
                firstName: string;
                lastName: string;
                clickupUserId: string | null;
                clickupEmail: string | null;
                active: boolean;
              };
            }
          | null
        >;
      }
    | undefined;
  return binding;
}

export async function getCurrentIdentityActor(): Promise<IdentityActor> {
  const loginEmail = await getCurrentLoginEmailOrThrow();
  const isAdmin = isAdminEmail(loginEmail);
  const identityBinding = getIdentityBindingDelegate();
  if (!identityBinding) {
    return { loginEmail, isAdmin, binding: null };
  }
  const binding = await identityBinding.findUnique({
    where: { loginEmail },
    include: { employee: true },
  });
  if (!binding || !binding.employee.active) {
    return { loginEmail, isAdmin, binding: null };
  }

  return {
    loginEmail,
    isAdmin,
    binding: {
      id: String(binding.id),
      employeeId: String(binding.employeeId),
      employeeCode: binding.employee.employeeCode,
      roleCode: binding.employee.roleCode,
      positionCode: binding.employee.positionCode,
      employeeName: `${binding.employee.firstName} ${binding.employee.lastName}`.trim(),
      clickupUserId: binding.employee.clickupUserId,
      clickupEmail: binding.employee.clickupEmail,
    },
  };
}

export function mapIdentityError(e: unknown): ActionResult<never> {
  if (e instanceof Error && e.message === "UNAUTHENTICATED") {
    return fail("ไม่พบบัญชีที่เข้าสู่ระบบ");
  }
  return fail("เกิดข้อผิดพลาดในการตรวจสอบตัวตน");
}
