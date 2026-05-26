"use server";

import { queryEmployeeForEdit } from "@/api/pm/pmms01/_queries";
import type { EmployeeEditData } from "@/api/pm/pmms01/types";

/** โหลดข้อมูลพนักงานสำหรับกรอกใน modal เลือกผู้ใช้ */
export async function fetchEmployeeForSetup(
  employeeId: string,
): Promise<EmployeeEditData | null> {
  return queryEmployeeForEdit(employeeId);
}
