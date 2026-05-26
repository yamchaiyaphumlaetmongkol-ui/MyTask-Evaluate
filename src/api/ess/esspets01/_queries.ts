/**
 * ESSPETS01 — อ่าน DB ฝั่ง server (ไม่มี "use server")
 */
import { queryTemplateList } from "@/api/_shared/template-list";
import type { TemplateSearchFilter } from "@/lib/template-search";
import type { EssTemplateSearchRow } from "@/api/ess/esspets01/types";

export async function queryEssTemplateSearch(
  filter: TemplateSearchFilter = {},
): Promise<EssTemplateSearchRow[]> {
  return queryTemplateList(filter);
}
