"use server";

import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import { prisma } from "@/lib/prisma";
import {
  getCurrentIdentityActor,
  getCurrentLoginEmailOrThrow,
  mapIdentityError,
} from "@/lib/auth-identity";
import { revalidatePath } from "next/cache";

function hasIdentityBindingModel(): boolean {
  return Boolean(
    (prisma as unknown as { userIdentityBinding?: object }).userIdentityBinding,
  );
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function revalidateIdentityPages() {
  revalidatePath("/");
  revalidatePath("/profile");
  revalidatePath("/admin/identity-bindings");
  revalidatePath("/pm/pmms01");
}

export async function getMyIdentityBinding(): Promise<
  ActionResult<{
    loginEmail: string;
    isAdmin: boolean;
    binding: Awaited<ReturnType<typeof getCurrentIdentityActor>>["binding"];
  }>
> {
  try {
    if (!hasIdentityBindingModel()) {
      return fail("ระบบ binding ยังไม่พร้อมใช้งาน (ต้อง generate Prisma ใหม่)");
    }
    const actor = await getCurrentIdentityActor();
    return ok({
      loginEmail: actor.loginEmail,
      isAdmin: actor.isAdmin,
      binding: actor.binding,
    });
  } catch (e) {
    return mapIdentityError(e);
  }
}

export async function bindMyIdentity(
  employeeId: string,
): Promise<ActionResult<{ bindingId: string }>> {
  try {
    if (!hasIdentityBindingModel()) {
      return fail("ระบบ binding ยังไม่พร้อมใช้งาน (ต้อง generate Prisma ใหม่)");
    }
    const loginEmail = await getCurrentLoginEmailOrThrow();
    const actor = await getCurrentIdentityActor();
    if (actor.binding) {
      return fail("บัญชีนี้ผูกตัวตนแล้ว");
    }
    const employeePk = BigInt(employeeId);

    const result = await prisma.$transaction(async (tx) => {
      const existingEmployeeBinding = await tx.userIdentityBinding.findUnique({
        where: { employeeId: employeePk },
      });
      if (existingEmployeeBinding) {
        throw new Error("EMPLOYEE_ALREADY_BOUND");
      }

      const employee = await tx.pmEmployee.findUnique({
        where: { id: employeePk },
      });
      if (!employee?.active) {
        throw new Error("EMPLOYEE_NOT_FOUND");
      }

      const created = await tx.userIdentityBinding.create({
        data: {
          loginEmail,
          employeeId: employeePk,
          createdByEmail: loginEmail,
          updatedByEmail: loginEmail,
        },
      });
      return { bindingId: String(created.id) };
    });

    revalidateIdentityPages();
    return ok(result);
  } catch (e) {
    if (e instanceof Error && e.message === "EMPLOYEE_ALREADY_BOUND") {
      return fail("บัญชีพนักงานนี้ถูกผูกกับผู้ใช้อื่นแล้ว");
    }
    if (e instanceof Error && e.message === "EMPLOYEE_NOT_FOUND") {
      return fail("ไม่พบพนักงานที่เลือก");
    }
    return mapIdentityError(e);
  }
}

export async function changeMyIdentity(
  employeeId: string,
): Promise<ActionResult<{ bindingId: string }>> {
  try {
    if (!hasIdentityBindingModel()) {
      return fail("ระบบ binding ยังไม่พร้อมใช้งาน (ต้อง generate Prisma ใหม่)");
    }
    const actor = await getCurrentIdentityActor();
    if (!actor.binding) {
      return fail("ยังไม่พบการผูกตัวตน กรุณาเลือกผู้ใช้งาน");
    }
    const employeePk = BigInt(employeeId);

    const result = await prisma.$transaction(async (tx) => {
      const targetBinding = await tx.userIdentityBinding.findUnique({
        where: { employeeId: employeePk },
      });
      if (targetBinding && String(targetBinding.id) !== actor.binding!.id) {
        throw new Error("EMPLOYEE_ALREADY_BOUND");
      }
      const employee = await tx.pmEmployee.findUnique({
        where: { id: employeePk },
      });
      if (!employee?.active) {
        throw new Error("EMPLOYEE_NOT_FOUND");
      }
      const updated = await tx.userIdentityBinding.update({
        where: { id: BigInt(actor.binding!.id) },
        data: {
          employeeId: employeePk,
          updatedByEmail: actor.loginEmail,
        },
      });
      return { bindingId: String(updated.id) };
    });

    revalidateIdentityPages();
    return ok(result);
  } catch (e) {
    if (e instanceof Error && e.message === "EMPLOYEE_ALREADY_BOUND") {
      return fail("บัญชีพนักงานนี้ถูกผูกกับผู้ใช้อื่นแล้ว");
    }
    if (e instanceof Error && e.message === "EMPLOYEE_NOT_FOUND") {
      return fail("ไม่พบพนักงานที่เลือก");
    }
    return mapIdentityError(e);
  }
}

export async function adminForceBind(
  loginEmail: string,
  employeeId: string,
): Promise<ActionResult<{ bindingId: string }>> {
  try {
    if (!hasIdentityBindingModel()) {
      return fail("ระบบ binding ยังไม่พร้อมใช้งาน (ต้อง generate Prisma ใหม่)");
    }
    const actor = await getCurrentIdentityActor();
    if (!actor.isAdmin) {
      return fail("คุณไม่มีสิทธิ์ทำรายการนี้");
    }
    const normalizedLoginEmail = normalizeEmail(loginEmail);
    const employeePk = BigInt(employeeId);

    const result = await prisma.$transaction(async (tx) => {
      const employee = await tx.pmEmployee.findUnique({
        where: { id: employeePk },
      });
      if (!employee?.active) {
        throw new Error("EMPLOYEE_NOT_FOUND");
      }

      await tx.userIdentityBinding.deleteMany({
        where: {
          OR: [{ loginEmail: normalizedLoginEmail }, { employeeId: employeePk }],
        },
      });

      const created = await tx.userIdentityBinding.create({
        data: {
          loginEmail: normalizedLoginEmail,
          employeeId: employeePk,
          createdByEmail: actor.loginEmail,
          updatedByEmail: actor.loginEmail,
        },
      });
      return { bindingId: String(created.id) };
    });

    revalidateIdentityPages();
    return ok(result);
  } catch (e) {
    if (e instanceof Error && e.message === "EMPLOYEE_NOT_FOUND") {
      return fail("ไม่พบพนักงานที่เลือก");
    }
    return mapIdentityError(e);
  }
}

export async function adminUnbind(
  bindingId: string,
): Promise<ActionResult<{ bindingId: string }>> {
  try {
    if (!hasIdentityBindingModel()) {
      return fail("ระบบ binding ยังไม่พร้อมใช้งาน (ต้อง generate Prisma ใหม่)");
    }
    const actor = await getCurrentIdentityActor();
    if (!actor.isAdmin) {
      return fail("คุณไม่มีสิทธิ์ทำรายการนี้");
    }

    await prisma.userIdentityBinding.delete({
      where: { id: BigInt(bindingId) },
    });
    revalidateIdentityPages();
    return ok({ bindingId });
  } catch (e) {
    if (e instanceof Error && e.message.includes("Record to delete does not exist")) {
      return fail("ไม่พบการผูกตัวตนที่ต้องการลบ");
    }
    return mapIdentityError(e);
  }
}

export async function queryIdentityBindings() {
  if (!hasIdentityBindingModel()) return [];
  const rows = await prisma.userIdentityBinding.findMany({
    orderBy: { updatedDate: "desc" },
    include: { employee: true },
  });
  return rows.map((row) => ({
    id: String(row.id),
    loginEmail: row.loginEmail,
    employeeId: String(row.employeeId),
    employeeCode: row.employee.employeeCode,
    employeeName: `${row.employee.firstName} ${row.employee.lastName}`.trim(),
    clickupUserId: row.employee.clickupUserId,
    clickupEmail: row.employee.clickupEmail,
    updatedDate: row.updatedDate.toISOString(),
  }));
}
