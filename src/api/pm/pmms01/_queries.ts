import { employeeDisplayName } from "@/lib/employee-display";
import { prisma } from "@/lib/prisma";
import type { EmployeeEditData, EmployeeRow } from "@/api/pm/pmms01/types";

export async function queryEmployees(): Promise<EmployeeRow[]> {
  const [rows, roles, positions] = await Promise.all([
    prisma.pmEmployee.findMany({
      where: { active: true },
      orderBy: { id: "asc" },
    }),
    prisma.pmRole.findMany({
      where: { active: true },
      select: { roleCode: true, roleName: true },
    }),
    prisma.pmPosition.findMany({
      where: { active: true },
      select: { positionCode: true, positionName: true },
    }),
  ]);

  const roleMap = new Map(roles.map((r) => [r.roleCode, r.roleName]));
  const posMap = new Map(positions.map((p) => [p.positionCode, p.positionName]));

  return rows.map((e) => ({
    id: String(e.id),
    employeeCode: e.employeeCode,
    titleName: e.titleName ?? "",
    firstName: e.firstName,
    lastName: e.lastName,
    email: e.email,
    clickupUserId: e.clickupUserId,
    clickupUsername: e.clickupUsername,
    clickupProfileImage: e.clickupProfileImage,
    roleCode: e.roleCode,
    roleName: e.roleCode ? roleMap.get(e.roleCode) ?? null : null,
    positionCode: e.positionCode,
    positionName: e.positionCode ? posMap.get(e.positionCode) ?? null : null,
    displayName: employeeDisplayName(e),
  }));
}

export async function queryEmployeeForEdit(
  employeeId: string,
): Promise<EmployeeEditData | null> {
  const e = await prisma.pmEmployee.findUnique({
    where: { id: BigInt(employeeId) },
  });
  if (!e?.active) return null;

  const [roles, positions] = await Promise.all([
    prisma.pmRole.findMany({
      where: { active: true },
      orderBy: { roleCode: "asc" },
      select: { roleCode: true, roleName: true },
    }),
    prisma.pmPosition.findMany({
      where: { active: true },
      orderBy: { positionCode: "asc" },
      select: { positionCode: true, positionName: true },
    }),
  ]);

  return {
    id: String(e.id),
    employeeCode: e.employeeCode,
    titleName: e.titleName ?? "",
    firstName: e.firstName,
    lastName: e.lastName,
    email: e.email,
    roleCode: e.roleCode ?? "",
    positionCode: e.positionCode ?? "",
    clickupUsername: e.clickupUsername,
    clickupProfileImage: e.clickupProfileImage,
    roles: roles.map((r) => ({ code: r.roleCode, name: r.roleName })),
    positions: positions.map((p) => ({
      code: p.positionCode,
      name: p.positionName,
    })),
  };
}

export async function queryImportedClickUpIds(): Promise<Set<string>> {
  const map = await queryImportedClickUpMap();
  return new Set(map.keys());
}

/** ClickUp user id → ข้อมูลพนักงานที่ active ในระบบ */
export async function queryImportedClickUpMap(): Promise<
  Map<string, { employeeId: string; employeeCode: string | null }>
> {
  const rows = await prisma.pmEmployee.findMany({
    where: { active: true, clickupUserId: { not: null } },
    select: { id: true, clickupUserId: true, employeeCode: true },
  });
  const map = new Map<
    string,
    { employeeId: string; employeeCode: string | null }
  >();
  for (const row of rows) {
    const id = row.clickupUserId?.trim();
    if (!id) continue;
    map.set(id, {
      employeeId: String(row.id),
      employeeCode: row.employeeCode,
    });
  }
  return map;
}
