"use server";

import { getCurrentUser } from "@/lib/auth/get-current-user";
import type { AuthUser } from "@/lib/auth/types";

export async function getSessionUser(): Promise<AuthUser | null> {
  return getCurrentUser();
}
