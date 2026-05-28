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

/** พนักงานที่ผูกกับอีเมล login ปัจจุบัน */
export async function queryEmployeeByLoginEmail(
  email: string | null | undefined,
): Promise<EmployeeOption | null> {
  const loginEmail = email?.trim().toLowerCase();
  if (!loginEmail) return null;

  const identityBinding = (prisma as unknown as { userIdentityBinding?: unknown })
    .userIdentityBinding as
    | {
        findUnique: (args: {
          where: { loginEmail: string };
          include: { employee: true };
        }) => Promise<
          | {
              employee: {
                id: bigint;
                employeeCode: string | null;
                firstName: string;
                lastName: string;
                titleName: string | null;
                clickupUsername: string | null;
                clickupProfileImage: string | null;
                active: boolean;
              };
            }
          | null
        >;
      }
    | undefined;

  if (!identityBinding) {
    return null;
  }

  try {
    const binding = await identityBinding.findUnique({
      where: { loginEmail },
      include: { employee: true },
    });
    if (!binding?.employee.active) return null;

    return {
      id: String(binding.employee.id),
      code: binding.employee.employeeCode,
      name: employeeDisplayName(binding.employee),
      profileImage: binding.employee.clickupProfileImage,
    };
  } catch {
    return null;
  }
}
