import type { PeEntityType, TopicPermissionSelection } from "@/api/pe/pems01/types";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type PermissionCreate = Prisma.PeEvaluationPermissionCreateManyInput;

export function buildPermissionRows(
  entityType: PeEntityType,
  entityId: bigint,
  sel: TopicPermissionSelection,
): PermissionCreate[] {
  const rows: PermissionCreate[] = [];

  const push = (
    permissionType: "edit" | "evaluate",
    targetType: "role" | "position",
    isAll: boolean,
    codes: string[],
  ) => {
    if (isAll) {
      rows.push({
        entityType,
        entityId,
        permissionType,
        targetType,
        targetCode: null,
        isAll: true,
      });
      return;
    }
    for (const code of codes) {
      rows.push({
        entityType,
        entityId,
        permissionType,
        targetType,
        targetCode: code,
        isAll: false,
      });
    }
  };

  push("edit", "role", sel.editAllRoles, sel.editRoleCodes);
  push("edit", "position", sel.editAllPositions, sel.editPositionCodes);
  push("evaluate", "role", sel.evaluateAllRoles, sel.evaluateRoleCodes);
  push("evaluate", "position", sel.evaluateAllPositions, sel.evaluatePositionCodes);

  return rows;
}

export function selectionFromPermissionRows(
  rows: {
    permissionType: string;
    targetType: string;
    targetCode: string | null;
    isAll: boolean;
  }[],
): TopicPermissionSelection {
  const sel = {
    editAllRoles: false,
    editAllPositions: false,
    evaluateAllRoles: false,
    evaluateAllPositions: false,
    editRoleCodes: [] as string[],
    editPositionCodes: [] as string[],
    evaluateRoleCodes: [] as string[],
    evaluatePositionCodes: [] as string[],
  };

  for (const r of rows) {
    const key =
      r.permissionType === "edit" && r.targetType === "role"
        ? "editRole"
        : r.permissionType === "edit" && r.targetType === "position"
          ? "editPosition"
          : r.permissionType === "evaluate" && r.targetType === "role"
            ? "evaluateRole"
            : "evaluatePosition";

    if (r.isAll) {
      if (key === "editRole") sel.editAllRoles = true;
      if (key === "editPosition") sel.editAllPositions = true;
      if (key === "evaluateRole") sel.evaluateAllRoles = true;
      if (key === "evaluatePosition") sel.evaluateAllPositions = true;
    } else if (r.targetCode) {
      if (key === "editRole") sel.editRoleCodes.push(r.targetCode);
      if (key === "editPosition") sel.editPositionCodes.push(r.targetCode);
      if (key === "evaluateRole") sel.evaluateRoleCodes.push(r.targetCode);
      if (key === "evaluatePosition") sel.evaluatePositionCodes.push(r.targetCode);
    }
  }

  return sel;
}

export async function loadPermissionsFor(
  entityType: PeEntityType,
  entityId: bigint,
): Promise<TopicPermissionSelection> {
  const rows = await prisma.peEvaluationPermission.findMany({
    where: { entityType, entityId },
    select: {
      permissionType: true,
      targetType: true,
      targetCode: true,
      isAll: true,
    },
  });
  return selectionFromPermissionRows(rows);
}

/** โหลดสิทธิ์หลายหัวข้อพร้อมกัน — key = String(entityId) */
export async function loadPermissionsForMany(
  entityType: PeEntityType,
  entityIds: bigint[],
): Promise<Map<string, TopicPermissionSelection>> {
  const map = new Map<string, TopicPermissionSelection>();
  if (entityIds.length === 0) return map;

  const rows = await prisma.peEvaluationPermission.findMany({
    where: { entityType, entityId: { in: entityIds } },
    select: {
      entityId: true,
      permissionType: true,
      targetType: true,
      targetCode: true,
      isAll: true,
    },
  });

  const grouped = new Map<string, typeof rows>();
  for (const id of entityIds) {
    grouped.set(String(id), []);
  }
  for (const r of rows) {
    const key = String(r.entityId);
    grouped.get(key)?.push(r);
  }

  for (const [key, permRows] of grouped) {
    map.set(key, selectionFromPermissionRows(permRows));
  }
  return map;
}

export async function replacePermissions(
  tx: Pick<typeof prisma, "peEvaluationPermission">,
  entityType: PeEntityType,
  entityId: bigint,
  sel: TopicPermissionSelection,
) {
  await tx.peEvaluationPermission.deleteMany({
    where: { entityType, entityId },
  });
  const rows = buildPermissionRows(entityType, entityId, sel);
  if (rows.length > 0) {
    await tx.peEvaluationPermission.createMany({ data: rows });
  }
}

export function creatorDisplayName(
  creator: { titleName: string | null; firstName: string; lastName: string } | null,
): string {
  if (!creator) return "—";
  const title = creator.titleName ? `${creator.titleName} ` : "";
  return `${title}${creator.firstName} ${creator.lastName}`.trim();
}
