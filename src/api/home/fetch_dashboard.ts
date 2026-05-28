"use server";

import {
  queryHomeDashboard,
  type HomeDashboardSummary,
} from "@/api/home/dashboard";

export async function fetchHomeDashboard(
  employeeCode: string,
): Promise<HomeDashboardSummary | null> {
  return queryHomeDashboard(employeeCode);
}
