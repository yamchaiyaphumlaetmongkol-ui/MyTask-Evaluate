/** ESSPETS01 — ค้นหาแบบประเมินตนเอง */

export type EssTemplateSearchRow = {
  id: string;
  templateName: string;
  headCount: number;
  startDate: string | null;
  endDate: string | null;
  evaluationPeriod: string | null;
  createdAt: string;
};
