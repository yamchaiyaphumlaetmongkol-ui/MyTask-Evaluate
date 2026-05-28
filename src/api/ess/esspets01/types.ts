/** ESSPETS01 — ค้นหาแบบประเมินตนเอง */

import type { SelfEvalListStatus } from "@/lib/self-eval-completion";

export type EssTemplateSearchRow = {
  id: string;
  templateName: string;
  evaluationYear: number;
  headCount: number;
  startDate: string | null;
  endDate: string | null;
  evaluationPeriod: string | null;
  createdAt: string;
  selfEvalStatus: SelfEvalListStatus | null;
  selfEvalStatusLabel: string | null;
};
