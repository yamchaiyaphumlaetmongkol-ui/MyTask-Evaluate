import type { TopicPermissionSelection } from "@/api/pe/pems01/types";

type EmployeeAccess = {
  roleCode: string | null;
  positionCode: string | null;
};

function matchesPermission(
  perm: TopicPermissionSelection,
  employee: EmployeeAccess,
  kind: "edit" | "evaluate",
): boolean {
  const role = employee.roleCode?.trim() || "";
  const pos = employee.positionCode?.trim() || "";

  if (kind === "edit") {
    const roleOk =
      perm.editAllRoles || (role !== "" && perm.editRoleCodes.includes(role));
    const posOk =
      perm.editAllPositions ||
      (pos !== "" && perm.editPositionCodes.includes(pos));
    return roleOk || posOk;
  }

  const roleOk =
    perm.evaluateAllRoles ||
    (role !== "" && perm.evaluateRoleCodes.includes(role));
  const posOk =
    perm.evaluateAllPositions ||
    (pos !== "" && perm.evaluatePositionCodes.includes(pos));
  return roleOk || posOk;
}

/** สิทธิ์แก้ไขหัวข้อ = เจ้าของแบบประเมิน (ติดตามสถานะ ESSPETS03) */
export function canEditEmployee(
  perm: TopicPermissionSelection,
  employee: EmployeeAccess,
): boolean {
  return matchesPermission(perm, employee, "edit");
}

/** สิทธิ์ประเมินคนอื่น (manager — ESSPETS04) */
export function canEvaluateEmployee(
  perm: TopicPermissionSelection,
  employee: EmployeeAccess,
): boolean {
  return matchesPermission(perm, employee, "evaluate");
}

/** แบบประเมินต้องมีสิทธิ์แก้ไขทุกหัวข้อหลัก */
export function templateHasEditAccess(
  headPerms: TopicPermissionSelection[],
  viewer: EmployeeAccess,
): boolean {
  if (headPerms.length === 0) return false;
  return headPerms.every((p) => canEditEmployee(p, viewer));
}

/** แบบประเมินต้องมีสิทธิ์ประเมิน (manager) ทุกหัวข้อหลัก — ESSPETS04 */
export function templateHasEvaluateAccess(
  headPerms: TopicPermissionSelection[],
  manager: EmployeeAccess,
): boolean {
  if (headPerms.length === 0) return false;
  return headPerms.every((p) => canEvaluateEmployee(p, manager));
}

/** ดูสถานะของตนเอง (ไม่ต้องมีสิทธิ์เจ้าของแบบประเมิน) */
export function canViewOwnEvaluationStatus(
  viewerEmployeeCode: string,
  subjectEmployeeCode: string,
): boolean {
  return (
    viewerEmployeeCode.trim() !== "" &&
    viewerEmployeeCode === subjectEmployeeCode
  );
}
