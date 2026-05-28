import { existsSync } from "node:fs";
import { strict as assert } from "node:assert";
import { Workbook } from "exceljs";
import { getEvaTemplateFilePath, readEvaTemplateArrayBuffer } from "@/lib/excel/eva-template-file";
import { parseEvaluationTemplateExcel } from "@/lib/excel/parse-evaluation-template";

async function buildPeFormRows(
  rows: Array<Array<string | number | null>>,
): Promise<ArrayBuffer> {
  const wb = new Workbook();
  const ws = wb.addWorksheet("Sheet1");
  ws.addRow(["แบบประเมิน 2026"]);
  ws.addRow([]);
  ws.addRow(["", "", "", "", "Year: 2026"]);
  ws.addRow([]);
  ws.addRow([]);
  for (let r = 6; r <= 8; r += 1) {
    ws.addRow(["หัวข้อหลัก", "", "สัดส่วน", "หัวข้อย่อย", "", "ต่ำสุด", "สูงสุด", "เกรด", "รายละเอียด"]);
  }
  rows.forEach((r) => ws.addRow(r));
  return (await wb.xlsx.writeBuffer()) as ArrayBuffer;
}

async function run() {
  const results: Array<{ name: string; ok: boolean; error?: string }> = [];

  const cases: Array<{ name: string; run: () => Promise<void> }> = [
    {
      name: "happy path",
      run: async () => {
        const file = await buildPeFormRows([
          ["A head", "", 50, "sub1", "", 1, 5, "A", "ดี"],
          ["A head", "", 50, "sub1", "", 0, 0, "B", "พอใช้"],
          ["B head", "", 50, "sub2", "", 1, 3, "", "เกณฑ์เดียว"],
        ]);
        const res = await parseEvaluationTemplateExcel({
          file,
          selectedPeriod: "H1",
        });
        assert.equal(res.success, true);
        if (res.success) assert.equal(res.structure.heads.length, 2);
      },
    },
    {
      name: "missing data",
      run: async () => {
        const file = await buildPeFormRows([]);
        const res = await parseEvaluationTemplateExcel({
          file,
          selectedPeriod: "H1",
        });
        assert.equal(res.success, false);
      },
    },
    {
      name: "swapped min/max columns",
      run: async () => {
        const file = await buildPeFormRows([
          ["A", "", 100, "sub", "", 5, 1, "A", "สลับคอลัมน์"],
        ]);
        const res = await parseEvaluationTemplateExcel({
          file,
          selectedPeriod: "H1",
        });
        assert.equal(res.success, true);
        if (res.success) {
          const d = res.structure.heads[0].subs[0].details[0];
          assert.equal(d.minScore, 1);
          assert.equal(d.maxScore, 5);
        }
      },
    },
    {
      name: "proportion not 100",
      run: async () => {
        const file = await buildPeFormRows([
          ["A", "", 30, "sub", "", 1, 5, "", "x"],
        ]);
        const res = await parseEvaluationTemplateExcel({
          file,
          selectedPeriod: "H1",
        });
        assert.equal(res.success, false);
      },
    },
    {
      name: "EVA_TEMPLATE.xlsx",
      run: async () => {
        if (!existsSync(getEvaTemplateFilePath())) {
          console.log("SKIP: EVA_TEMPLATE.xlsx not found in public/");
          return;
        }
        const file = readEvaTemplateArrayBuffer();
        const res = await parseEvaluationTemplateExcel({
          file,
          selectedSheet: "66038",
          selectedPeriod: "H2",
        });
        assert.equal(res.success, true);
        if (res.success) {
          assert.ok(res.structure.heads.length > 0);
        }
      },
    },
    {
      name: "multi sheet question",
      run: async () => {
        const wb = new Workbook();
        wb.addWorksheet("A").addRow(["x"]);
        wb.addWorksheet("B").addRow(["y"]);
        const file = (await wb.xlsx.writeBuffer()) as ArrayBuffer;
        const res = await parseEvaluationTemplateExcel({
          file,
          selectedPeriod: "H1",
        });
        assert.equal(res.success, false);
        assert.ok(res.questions.some((q) => q.id === "sheet"));
      },
    },
  ];

  for (const c of cases) {
    try {
      await c.run();
      results.push({ name: c.name, ok: true });
    } catch (e) {
      results.push({
        name: c.name,
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  const fail = results.filter((r) => !r.ok);
  results.forEach((r) => {
    console.log(r.ok ? `PASS: ${r.name}` : `FAIL: ${r.name} -> ${r.error}`);
  });
  if (fail.length) process.exitCode = 1;
  else console.log(`ALL PASS (${results.length})`);
}

void run();
