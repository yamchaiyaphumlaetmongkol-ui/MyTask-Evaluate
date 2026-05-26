import { prisma } from "@/lib/prisma";
import type { PositionRow } from "@/api/pm/pmms03/types";

export async function queryPositions(): Promise<PositionRow[]> {
  const rows = await prisma.pmPosition.findMany({
    where: { active: true },
    orderBy: { positionCode: "asc" },
  });
  return rows.map((p) => ({
    id: String(p.id),
    positionCode: p.positionCode,
    positionName: p.positionName,
    description: p.description ?? "",
    status: p.status ?? "",
  }));
}
