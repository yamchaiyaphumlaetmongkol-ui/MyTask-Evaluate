import { prisma } from "@/lib/prisma";
import type { RoleRow } from "@/api/pm/pmms02/types";

export async function queryRoles(): Promise<RoleRow[]> {
  const rows = await prisma.pmRole.findMany({
    where: { active: true },
    orderBy: { roleCode: "asc" },
  });
  return rows.map((r) => ({
    id: String(r.id),
    roleCode: r.roleCode,
    roleName: r.roleName,
    roleLevel: r.roleLevel,
    roleDescription: r.roleDescription ?? "",
    roleStatus: r.roleStatus ?? "",
  }));
}
