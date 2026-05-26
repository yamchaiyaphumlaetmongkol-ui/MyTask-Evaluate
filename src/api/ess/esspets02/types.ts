import type { GradeCriterion } from "@/lib/grade-criteria";

export type EvalStep = {
  subId: string;
  headTopic: string;
  subTopic: string;
  headProportion: number;
  minScore: number;
  maxScore: number;
  gradeCriteria: GradeCriterion[];
  savedScore: number | null;
  savedDetail: string | null;
};

export type SelfEvalSession = {
  templateId: string;
  templateName: string;
  employeeCode: string;
  employeeName: string;
  positionName: string | null;
  steps: EvalStep[];
};

export type { EmployeeOption } from "@/api/_shared/employee-options";

export type TemplateOption = {
  id: string;
  name: string;
};
