import { z } from "zod";
import { Workbook, type Worksheet } from "exceljs";

/** คอลัมน์ตามฟอร์ม PE (sheet 66038) — ไม่นำเข้าคอลัมน์คะแนน K เป็นต้นไป */
const COL = {
  head: 1,
  proportion: 3,
  sub: 4,
  min: 6,
  max: 7,
  grade: 8,
  detail: 9,
} as const;

const DATA_START_ROW = 9;

export type DiagnosticSeverity = "error" | "warning";

export type ExcelDiagnostic = {
  sheet: string;
  row: number | null;
  col: string | null;
  field: string;
  message: string;
  severity: DiagnosticSeverity;
};

export type MappingChoice = {
  id: string;
  label: string;
  description: string;
};

export type MappingQuestion = {
  id: string;
  prompt: string;
  choices: MappingChoice[];
};

const DetailSchema = z.object({
  detailTopic: z.string().min(1),
  minScore: z.number(),
  maxScore: z.number(),
  grade: z.string().default(""),
});

const SubSchema = z.object({
  subTopic: z.string().min(1),
  details: z.array(DetailSchema).min(1),
});

const HeadSchema = z.object({
  headTopic: z.string().min(1),
  proportion: z.number().min(0).max(100),
  subs: z.array(SubSchema).min(1),
});

export const ParsedStructureSchema = z.object({
  suggestedName: z.string().optional(),
  suggestedYear: z.number().int().min(2000).max(2100).optional(),
  /** ข้อความในเอกสารที่ใช้อ่านปี (แสดงให้ผู้ใช้แก้ไขได้) */
  suggestedYearNote: z.string().optional(),
  heads: z.array(HeadSchema).min(1),
});

export type ParsedStructure = z.infer<typeof ParsedStructureSchema>;

export type ParseTemplateInput = {
  file: ArrayBuffer;
  selectedSheet?: string;
  /** ผู้ใช้เลือกช่วงประเมินใน modal (บังคับ) */
  selectedPeriod: "H1" | "H2";
  enforceHeadProportion100?: boolean;
};

export type ParseTemplateResult =
  | {
      success: true;
      structure: ParsedStructure;
      diagnostics: ExcelDiagnostic[];
      questions: MappingQuestion[];
      sheetOptions: string[];
    }
  | {
      success: false;
      diagnostics: ExcelDiagnostic[];
      questions: MappingQuestion[];
      sheetOptions: string[];
    };

function normalizeCell(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "number") return String(v);
  if (typeof v === "string") return v.trim();
  if (typeof v === "object" && v && "richText" in (v as Record<string, unknown>)) {
    return (
      (v as { richText: Array<{ text: string }> }).richText
        .map((x) => x.text)
        .join("")
        .trim()
    );
  }
  if (typeof v === "object" && v && "result" in (v as Record<string, unknown>)) {
    return normalizeCell((v as { result: unknown }).result);
  }
  return String(v).trim();
}

function cellAt(ws: Worksheet, row: number, col: number): string {
  return normalizeCell(ws.getRow(row).getCell(col).value);
}

function parseNumber(v: string): number | null {
  if (!v) return null;
  const cleaned = v.replace("%", "").replace(/,/g, "").trim();
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

function colLetter(col: number): string {
  let n = col;
  let out = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    out = String.fromCharCode(65 + rem) + out;
    n = Math.floor((n - 1) / 26);
  }
  return out;
}

function normalizeTopic(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function detectYear(text: string): number | null {
  const m = text.match(/(25\d{2}|20\d{2})/);
  if (!m) return null;
  const n = Number(m[1]);
  if (n >= 2500) return n - 543;
  return n;
}

function detectYearFromSheet(ws: Worksheet): {
  year: number | null;
  note: string | null;
} {
  for (let row = 1; row <= 8; row += 1) {
    for (let col = 1; col <= 12; col += 1) {
      const text = cellAt(ws, row, col);
      if (!text) continue;
      const year = detectYear(text);
      if (year != null) {
        return { year, note: `แถว ${row}: ${text.replace(/\s+/g, " ").slice(0, 120)}` };
      }
    }
  }
  return { year: null, note: null };
}

function isDataRowEmpty(ws: Worksheet, row: number): boolean {
  for (let c = COL.head; c <= COL.detail; c += 1) {
    if (cellAt(ws, row, c)) return false;
  }
  return true;
}

function parsePeFormSheet(
  ws: Worksheet,
  enforceHeadProportion100: boolean,
): { structure?: ParsedStructure; diagnostics: ExcelDiagnostic[] } {
  const diagnostics: ExcelDiagnostic[] = [];
  const headMap = new Map<
    string,
    { proportion: number; subs: Map<string, z.infer<typeof DetailSchema>[]> }
  >();

  let currentHead = "";
  let currentProportion = 0;
  let currentSub = "";

  const { year: detectedYear, note: suggestedYearNote } = detectYearFromSheet(ws);
  const suggestedYear = detectedYear ?? undefined;
  const suggestedName =
    normalizeTopic(cellAt(ws, 1, 1)) || ws.name;

  for (let row = DATA_START_ROW; row <= ws.rowCount; row += 1) {
    if (isDataRowEmpty(ws, row)) continue;
    const rowText = cellAt(ws, row, COL.head);
    if (rowText.includes("หมายเหตุ")) continue;

    const headRaw = cellAt(ws, row, COL.head);
    if (headRaw) {
      currentHead = normalizeTopic(headRaw);
      const propRaw = cellAt(ws, row, COL.proportion);
      const prop = parseNumber(propRaw);
      if (prop != null) currentProportion = prop;
    }

    const subRaw = cellAt(ws, row, COL.sub) || cellAt(ws, row, COL.sub + 1);
    if (subRaw) {
      currentSub = normalizeTopic(subRaw);
    }

    const rawMin = parseNumber(cellAt(ws, row, COL.min));
    const rawMax = parseNumber(cellAt(ws, row, COL.max));
    const grade = cellAt(ws, row, COL.grade);
    const detailTopic = normalizeTopic(
      cellAt(ws, row, COL.detail) || cellAt(ws, row, COL.detail + 1),
    );

    if (!currentHead) {
      continue;
    }
    if (!currentSub) {
      if (detailTopic || rawMin != null || rawMax != null) {
        diagnostics.push({
          sheet: ws.name,
          row,
          col: colLetter(COL.sub),
          field: "subTopic",
          message: "พบเกณฑ์/คะแนนแต่ไม่มีหัวข้อย่อย",
          severity: "warning",
        });
      }
      continue;
    }

    if (rawMin == null || rawMax == null || !detailTopic) {
      continue;
    }
    const minScore = Math.min(rawMin, rawMax);
    const maxScore = Math.max(rawMin, rawMax);

    const head =
      headMap.get(currentHead) ??
      ({
        proportion: currentProportion,
        subs: new Map<string, z.infer<typeof DetailSchema>[]>(),
      } as const);
    if (currentProportion > 0) {
      (head as { proportion: number }).proportion = currentProportion;
    }
    const details = head.subs.get(currentSub) ?? [];
    details.push({
      detailTopic,
      minScore,
      maxScore,
      grade: grade.trim(),
    });
    head.subs.set(currentSub, details);
    headMap.set(currentHead, head);
  }

  if (headMap.size === 0) {
    diagnostics.push({
      sheet: ws.name,
      row: null,
      col: null,
      field: "data",
      message: "ไม่พบโครงสร้างหัวข้อหลัก/ย่อย/เกณฑ์ในแถวข้อมูล",
      severity: "error",
    });
    return { diagnostics };
  }

  const heads = Array.from(headMap.entries()).map(([headTopic, head]) => ({
    headTopic,
    proportion: head.proportion,
    subs: Array.from(head.subs.entries()).map(([subTopic, details]) => ({
      subTopic,
      details,
    })),
  }));

  const proportionTotal = heads.reduce((sum, h) => sum + h.proportion, 0);
  if (enforceHeadProportion100 && Math.abs(proportionTotal - 100) > 0.001) {
    diagnostics.push({
      sheet: ws.name,
      row: null,
      col: colLetter(COL.proportion),
      field: "proportion",
      message: `สัดส่วนหัวข้อหลักรวม ${proportionTotal.toFixed(2)}% (ต้องรวม 100%)`,
      severity: "error",
    });
  }

  const parsed = ParsedStructureSchema.safeParse({
    suggestedName,
    suggestedYear,
    suggestedYearNote: suggestedYearNote ?? undefined,
    heads,
  });
  if (!parsed.success) {
    diagnostics.push({
      sheet: ws.name,
      row: null,
      col: null,
      field: "payload",
      message: parsed.error.issues[0]?.message ?? "โครงสร้างไม่ถูกต้อง",
      severity: "error",
    });
    return { diagnostics };
  }

  if (diagnostics.some((d) => d.severity === "error")) {
    return { diagnostics };
  }
  return { structure: parsed.data, diagnostics };
}

export async function parseEvaluationTemplateExcel(
  input: ParseTemplateInput,
): Promise<ParseTemplateResult> {
  const diagnostics: ExcelDiagnostic[] = [];
  const workbook = new Workbook();
  await workbook.xlsx.load(input.file);

  const sheetOptions = workbook.worksheets.map((s) => s.name);
  const questions: MappingQuestion[] = [];

  if (workbook.worksheets.length > 1 && !input.selectedSheet) {
    questions.push({
      id: "sheet",
      prompt: "ไฟล์มีหลาย sheet กรุณาเลือก sheet ที่ต้องการนำเข้า",
      choices: workbook.worksheets.slice(0, 5).map((s) => ({
        id: s.name,
        label: s.name,
        description: `นำเข้าโครงสร้างจาก sheet ${s.name}`,
      })),
    });
    return { success: false, diagnostics, questions, sheetOptions };
  }

  const worksheet = input.selectedSheet
    ? workbook.getWorksheet(input.selectedSheet)
    : workbook.worksheets[0];

  if (!worksheet) {
    return {
      success: false,
      diagnostics: [
        {
          sheet: "-",
          row: null,
          col: null,
          field: "sheet",
          message: "ไม่พบ worksheet ที่เลือก",
          severity: "error",
        },
      ],
      questions: [],
      sheetOptions,
    };
  }

  const result = parsePeFormSheet(
    worksheet,
    input.enforceHeadProportion100 ?? true,
  );

  if (!result.structure) {
    return {
      success: false,
      diagnostics: [...diagnostics, ...result.diagnostics],
      questions,
      sheetOptions,
    };
  }

  return {
    success: true,
    structure: result.structure,
    diagnostics: result.diagnostics,
    questions,
    sheetOptions,
  };
}

/** payload สำหรับบันทึก — ผู้ใช้กรอกชื่อรอบ/ปี/ช่วง/วันที่ใน modal */
export const ImportTemplatePayloadSchema = z
  .object({
    structure: ParsedStructureSchema,
    templateName: z.string().min(1, "กรุณากรอกชื่อแบบประเมิน"),
    evaluationYear: z.coerce.number().int().min(2000).max(2100),
    evaluationPeriod: z.enum(["H1", "H2"]),
    startDate: z.string().min(1),
    endDate: z.string().min(1),
    importMode: z.enum(["create", "update"]),
    roundId: z.string().optional(),
  })
  .refine((d) => d.startDate <= d.endDate, {
    message: "วันเริ่มต้องไม่เกินวันสิ้นสุด",
    path: ["endDate"],
  })
  .refine((d) => d.importMode !== "update" || Boolean(d.roundId), {
    message: "กรุณาเลือกรอบที่ต้องการอัปเดต",
    path: ["roundId"],
  });

export type ImportTemplatePayload = z.infer<typeof ImportTemplatePayloadSchema>;
