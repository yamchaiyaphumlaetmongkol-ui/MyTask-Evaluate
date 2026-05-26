"use server";

import { queryManagerEvalQueueList } from "@/api/ess/esspets04/_queries";
import type { ManagerEvalQueueRow } from "@/api/ess/esspets04/types";
import type { ManagerEvalQueueFilter } from "@/lib/manager-eval-queue-filter";

export type Esspets04TablePayload = {
  rows: ManagerEvalQueueRow[];
};

export async function fetchEsspets04Table(
  managerCode: string,
  filter: ManagerEvalQueueFilter,
): Promise<Esspets04TablePayload> {
  const rows = await queryManagerEvalQueueList(managerCode, filter);
  return { rows };
}
