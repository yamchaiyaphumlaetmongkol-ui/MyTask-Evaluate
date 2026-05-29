/** รายการแบบประเมิน — หน้า list */
export type EvaluationStatusTemplateRow = {
  id: string;
  templateName: string;
  startDate: string | null;
  endDate: string | null;
  evaluationPeriod: string | null;
  headCount: number;
  subCount: number;
};

export type EvaluationStatusSubRow = {
  subId: string;
  subTopic: string;
  selfScore: number | null;
  selfDetail: string | null;
  managerScore: number | null;
  managerDetail: string | null;
};

export type EvaluationStatusHeadBlock = {
  headId: string;
  headTopic: string;
  subs: EvaluationStatusSubRow[];
};

/** รายละเอียดแบบประเมิน + ผลตามพนักงาน */
export type EvaluationStatusTemplateDetail = {
  templateId: string;
  templateName: string;
  startDate: string | null;
  endDate: string | null;
  evaluationPeriod: string | null;
  employeeCode: string;
  employeeName: string;
  /** ผู้ประเมิน (ผู้จัดการ) ที่บันทึกผลประเมินพนักงาน */
  evaluatedByCode: string | null;
  evaluatedByName: string | null;
  heads: EvaluationStatusHeadBlock[];
};
