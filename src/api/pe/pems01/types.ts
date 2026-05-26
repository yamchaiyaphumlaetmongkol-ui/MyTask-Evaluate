/** PEMS01 — แบบประเมิน + หัวข้อ + สิทธิ์ role/ตำแหน่ง */

export type PeEntityType = "head" | "sub";

export type TopicPermissionSelection = {
  editAllRoles: boolean;
  editAllPositions: boolean;
  evaluateAllRoles: boolean;
  evaluateAllPositions: boolean;
  editRoleCodes: string[];
  editPositionCodes: string[];
  evaluateRoleCodes: string[];
  evaluatePositionCodes: string[];
};

export const emptyTopicPermission = (): TopicPermissionSelection => ({
  editAllRoles: false,
  editAllPositions: false,
  evaluateAllRoles: false,
  evaluateAllPositions: false,
  editRoleCodes: [],
  editPositionCodes: [],
  evaluateRoleCodes: [],
  evaluatePositionCodes: [],
});

export type MasterRole = { code: string; name: string };
export type MasterPosition = { code: string; name: string };

export type PeMasters = { roles: MasterRole[]; positions: MasterPosition[] };

/** แถวรายการรอบประเมิน — id = roundId */
export type EvaluationTemplateRow = {
  id: string;
  templateName: string;
  masterId: string;
  masterName: string;
  evaluationYear: number;
  evaluationPeriod: string | null;
  status: string;
  headCount: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
};

export type EvaluationDetailDraft = {
  clientKey: string;
  id?: string;
  detailTopic: string;
  minScore: number;
  maxScore: number;
  grade: string;
};

/** เกณฑ์เกรดต่อหัวข้อย่อย — เก็บ JSON ใน pe_evaluation_sub.grade_criteria (แสดงใน ESS) */

export type EvaluationSubDraft = {
  clientKey: string;
  id?: string;
  subTopic: string;
  details: EvaluationDetailDraft[];
};

export type EvaluationHeadDraft = {
  clientKey: string;
  id?: string;
  headTopic: string;
  proportion: number;
  permissions: TopicPermissionSelection;
  subs: EvaluationSubDraft[];
};

export type EvaluationTemplateFormState = {
  templateId?: string;
  templateName: string;
  evaluationPeriod: string;
  startDate: string;
  endDate: string;
  heads: EvaluationHeadDraft[];
};

export function newClientKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `k-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const emptyDetailDraft = (): EvaluationDetailDraft => ({
  clientKey: newClientKey(),
  detailTopic: "",
  minScore: 0,
  maxScore: 0,
  grade: "",
});

export const emptySubDraft = (): EvaluationSubDraft => ({
  clientKey: newClientKey(),
  subTopic: "",
  details: [emptyDetailDraft()],
});

export const emptyHeadDraft = (): EvaluationHeadDraft => ({
  clientKey: newClientKey(),
  headTopic: "",
  proportion: 0,
  permissions: emptyTopicPermission(),
  subs: [],
});

export const initialFormState = (): EvaluationTemplateFormState => ({
  templateName: "",
  evaluationPeriod: "H1",
  startDate: "",
  endDate: "",
  heads: [],
});

/** แม่แบบ (blueprint) — ไม่มีวันที่/ช่วงรอบ */
export type MasterBlueprintFormState = {
  masterId?: string;
  masterName: string;
  description: string;
  heads: EvaluationHeadDraft[];
};

export type MasterBlueprintRow = {
  id: string;
  masterName: string;
  headCount: number;
  createdAt: string;
};

export const initialMasterFormState = (): MasterBlueprintFormState => ({
  masterName: "",
  description: "",
  heads: [],
});
