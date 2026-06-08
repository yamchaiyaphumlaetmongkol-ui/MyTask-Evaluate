import { prisma } from "@/lib/prisma";

export type AuthUserAdminRow = {
  authId: string;
  username: string;
  role: "admin" | "user";
  employeeId: string | null;
  employeeCode: string | null;
  employeeName: string | null;
};

export async function queryAuthUsersForAdmin(): Promise<AuthUserAdminRow[]> {
  const rows = await prisma.appUserAuth.findMany({
    orderBy: [{ role: "asc" }, { username: "asc" }],
    include: {
      employee: {
        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
          active: true,
        },
      },
    },
  });

  return rows.map((row) => {
    const employee = row.employee?.active ? row.employee : null;
    return {
      authId: String(row.id),
      username: row.username,
      role: row.role,
      employeeId: employee ? String(employee.id) : null,
      employeeCode: employee?.employeeCode ?? null,
      employeeName: employee
        ? `${employee.firstName} ${employee.lastName}`.trim()
        : null,
    };
  });
}
