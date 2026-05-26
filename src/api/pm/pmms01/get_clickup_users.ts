"use server";

import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import { queryImportedClickUpMap } from "@/api/pm/pmms01/_queries";
import type { ClickUpUserOption } from "@/api/pm/pmms01/types";
import { fetchClickUpMembers } from "@/lib/clickup";

export async function getClickUpUsersForImport(): Promise<
  ActionResult<{ users: ClickUpUserOption[] }>
> {
  try {
    const [members, importedMap] = await Promise.all([
      fetchClickUpMembers(),
      queryImportedClickUpMap(),
    ]);

    const users: ClickUpUserOption[] = members.map((m) => {
      const existing = importedMap.get(m.id);
      return {
        id: m.id,
        username: m.username,
        email: m.email,
        profilePicture: m.profilePicture,
        alreadyImported: Boolean(existing),
        employeeCode: existing?.employeeCode ?? null,
        employeeId: existing?.employeeId ?? null,
      };
    });

    return ok({ users });
  } catch (e) {
    console.error("getClickUpUsersForImport", e);
    const msg = e instanceof Error ? e.message : "ดึงรายชื่อ ClickUp ไม่สำเร็จ";
    return fail(msg);
  }
}
