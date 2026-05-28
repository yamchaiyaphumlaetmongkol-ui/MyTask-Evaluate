import { describe, expect, it } from "vitest";
import { Workbook } from "exceljs";
import { parseEvaluationTemplateExcel } from "./parse-evaluation-template";

async function buildPeFormRows(
  rows: Array<Array<string | number | null>>,
): Promise<ArrayBuffer> {
  const wb = new Workbook();
  const ws = wb.addWorksheet("Sheet1");
  ws.addRow(["แบบประเมิน 2026"]);
  ws.addRow([]);
  ws.addRow(["", "", "", "", "Year: 2026"]);
  for (let r = 0; r < 5; r += 1) ws.addRow([]);
  rows.forEach((r) => ws.addRow(r));
  return (await wb.xlsx.writeBuffer()) as ArrayBuffer;
}

describe("parseEvaluationTemplateExcel", () => {
  it("happy path", async () => {
    const file = await buildPeFormRows([
      ["A head", "", 50, "sub1", "", 1, 5, "A", "ดี"],
      ["A head", "", 50, "sub1", "", 0, 0, "B", "พอใช้"],
      ["B head", "", 50, "sub2", "", 1, 3, "", "เกณฑ์เดียว"],
    ]);
    const result = await parseEvaluationTemplateExcel({ file, selectedPeriod: "H1" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.structure.heads).toHaveLength(2);
    }
  });

  it("missing data", async () => {
    const file = await buildPeFormRows([]);
    const result = await parseEvaluationTemplateExcel({ file, selectedPeriod: "H1" });
    expect(result.success).toBe(false);
  });

  it("normalizes swapped min/max", async () => {
    const file = await buildPeFormRows([
      ["A", "", 100, "sub", "", 5, 1, "A", "ok"],
    ]);
    const result = await parseEvaluationTemplateExcel({ file, selectedPeriod: "H1" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.structure.heads[0].subs[0].details[0].minScore).toBe(1);
      expect(result.structure.heads[0].subs[0].details[0].maxScore).toBe(5);
    }
  });

  it("proportion not 100", async () => {
    const file = await buildPeFormRows([
      ["A", "", 30, "sub", "", 1, 5, "", "x"],
    ]);
    const result = await parseEvaluationTemplateExcel({ file, selectedPeriod: "H1" });
    expect(result.success).toBe(false);
  });

  it("multi sheet ambiguity", async () => {
    const wb = new Workbook();
    wb.addWorksheet("A").addRow(["x"]);
    wb.addWorksheet("B").addRow(["y"]);
    const file = (await wb.xlsx.writeBuffer()) as ArrayBuffer;
    const result = await parseEvaluationTemplateExcel({ file, selectedPeriod: "H1" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.questions.some((q) => q.id === "sheet")).toBe(true);
    }
  });
});
