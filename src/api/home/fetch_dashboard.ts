"use server";

import {
  queryHomeDashboard,
  type HomeDashboardSummary,
} from "@/api/home/dashboard";

export async function fetchHomeDashboard(
  employeeCode: string,
): Promise<HomeDashboardSummary | null> {
  try {
    return await queryHomeDashboard(employeeCode);
  } catch (e) {
    console.error("fetchHomeDashboard", e);
    return null;
  }
}
