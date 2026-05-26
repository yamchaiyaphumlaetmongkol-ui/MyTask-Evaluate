/** แสดงชื่อพนักงานตามกฎ UI (ภาพ + ชื่อ) */

export type EmployeeDisplayInput = {
  titleName?: string | null;
  firstName: string;
  lastName: string;
  clickupUsername?: string | null;
  clickupProfileImage?: string | null;
};

export function employeeDisplayName(e: EmployeeDisplayInput): string {
  const fn = e.firstName?.trim();
  const ln = e.lastName?.trim();
  if (fn || ln) {
    return [e.titleName, fn, ln].filter(Boolean).join(" ").trim();
  }
  return e.clickupUsername?.trim() || "—";
}

export function employeeHasLocalName(e: EmployeeDisplayInput): boolean {
  return Boolean(e.firstName?.trim() || e.lastName?.trim());
}
