import { employeeDisplayName } from "@/lib/employee-display";
import { prisma } from "@/lib/prisma";

export type EmployeeOption = {
  id: string;
  code: string | null;
  name: string;
  profileImage: string | null;
};

/** พนักงานทุกคนที่ active — ใช้เลือก user ทั่วแอป */
export async function queryEmployeeOptions(): Promise<EmployeeOption[]> {
  const rows = await prisma.pmEmployee.findMany({
    where: { active: true },
    orderBy: [{ employeeCode: "asc" }, { id: "asc" }],
  });
  return rows.map((e) => ({
    id: String(e.id),
    code: e.employeeCode,
    name: employeeDisplayName(e),
    profileImage: e.clickupProfileImage,
  }));
}
