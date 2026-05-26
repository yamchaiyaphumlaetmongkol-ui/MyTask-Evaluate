import type { MasterPosition, MasterRole } from "@/api/pe/pems01/types";

/** ข้อมูลตัวอย่าง — แทน pm_role / pm_position จนกว่าจะมี Server Action */
export const MOCK_ROLES: MasterRole[] = [
  { code: "R01", name: "พนักงาน" },
  { code: "R02", name: "หัวหน้างาน" },
  { code: "R03", name: "ผู้จัดการ" },
  { code: "R04", name: "HR" },
];

export const MOCK_POSITIONS: MasterPosition[] = [
  { code: "P01", name: "โปรแกรมเมอร์" },
  { code: "P02", name: "นักวิเคราะห์" },
  { code: "P03", name: "หัวหน้าทีม" },
  { code: "P04", name: "ผู้จัดการฝ่าย" },
];
