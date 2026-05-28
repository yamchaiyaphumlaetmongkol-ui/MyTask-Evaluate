import { Workbook } from "exceljs";

export type ExportRow = {
  headTopic: string;
  proportion: number;
  subTopic: string;
  minScore: number;
  maxScore: number;
  grade: string | null;
  criteriaDetail: string | null;
  selfScore: number | null;
  selfDetail: string | null;
  managerScore: number | null;
  managerDetail: string | null;
  subKey: string;
  isFirstOfSub: boolean;
};

export type BuildEvaluationExportInput = {
  templateName: string;
  employeeCode: string;
  employeeName: string;
  managerName: string;
  evaluationYear: number;
  evaluationPeriod: string | null;
  rows: ExportRow[];
};

function periodExportLabel(period: string | null): string {
  if (period === "H1") return "Mid";
  if (period === "H2") return "End";
  return "Mid/End";
}

export async function buildEvaluationExportWorkbook(
  input: BuildEvaluationExportInput,
): Promise<Buffer> {
  const wb = new Workbook();
  const ws = wb.addWorksheet("Evaluation");
  ws.columns = [
    { key: "a", width: 32 }, // หัวข้อหลัก
    { key: "b", width: 8 }, // สัดส่วน
    { key: "c", width: 52 }, // หัวข้อย่อย
    { key: "d", width: 10 }, // ต่ำสุด
    { key: "e", width: 10 }, // สูงสุด
    { key: "f", width: 10 }, // เกรด/ช่วง
    { key: "g", width: 58 }, // รายละเอียดเกณฑ์
    { key: "h", width: 10 }, // self score
    { key: "i", width: 36 }, // self detail
    { key: "j", width: 10 }, // manager score
    { key: "k", width: 36 }, // manager detail
  ];

  const titleBg = "FFF48B8D";
  const headBg = "FFF4E8C9";
  const resultBg = "FFCDEECF";
  const thinBorder = {
    top: { style: "thin" as const },
    left: { style: "thin" as const },
    bottom: { style: "thin" as const },
    right: { style: "thin" as const },
  };

  ws.mergeCells("A1:K1");
  ws.getCell("A1").value = `${input.templateName}`;
  ws.getCell("A1").font = { bold: true, size: 12 };
  ws.getCell("A1").fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: titleBg },
  };
  ws.getCell("A1").alignment = { horizontal: "center", vertical: "middle" };

  ws.mergeCells("A2:C2");
  ws.getCell("A2").value = `Name: ${input.employeeName}`;
  ws.getCell("A2").font = { bold: true };
  ws.getCell("A2").alignment = { horizontal: "left", vertical: "middle" };

  ws.mergeCells("A3:C3");
  ws.getCell("A3").value = `Emp ID: ${input.employeeCode}`;
  ws.getCell("A3").font = { bold: true };
  ws.getCell("A3").alignment = { horizontal: "left", vertical: "middle" };

  ws.mergeCells("D3:K3");
  ws.getCell("D3").value = `Year (Mid/End) : ${input.evaluationYear} - ${periodExportLabel(input.evaluationPeriod)}`;
  ws.getCell("D3").font = { bold: true };
  ws.getCell("D3").alignment = { horizontal: "left", vertical: "middle" };

  ws.mergeCells("A6:A7");
  ws.mergeCells("B6:B7");
  ws.mergeCells("C6:C7");
  ws.mergeCells("D6:F6");
  ws.mergeCells("G6:G7");
  ws.mergeCells("H6:I6");
  ws.mergeCells("J6:K6");

  ws.getCell("A6").value = "หัวข้อการประเมินหลัก";
  ws.getCell("B6").value = "สัดส่วน";
  ws.getCell("C6").value = "หัวข้อการประเมินย่อย / เงื่อนไข";
  ws.getCell("D6").value = "คะแนน";
  ws.getCell("D7").value = "ต่ำสุด";
  ws.getCell("E7").value = "สูงสุด";
  ws.getCell("F7").value = "ช่วง";
  ws.getCell("G6").value = "รายละเอียด";
  ws.getCell("H6").value = "ประเมินตนเอง";
  ws.getCell("H7").value = "คะแนน";
  ws.getCell("I7").value = "เหตุผล";
  ws.getCell("J6").value = `ผู้ประเมิน: ${input.managerName}`;
  ws.getCell("J7").value = "คะแนน";
  ws.getCell("K7").value = "เหตุผล";

  const headerCells = [
    "A6",
    "B6",
    "C6",
    "D6",
    "D7",
    "E7",
    "F7",
    "G6",
    "H6",
    "H7",
    "I7",
    "J6",
    "J7",
    "K7",
  ];
  for (const addr of headerCells) {
    const cell = ws.getCell(addr);
    const isResult = ["H7", "I7", "J7", "K7"].includes(addr);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: isResult ? resultBg : headBg },
    };
    cell.font = { bold: true };
    cell.border = thinBorder;
    cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true };
  }

  let rowCursor = 8;
  let headStart = rowCursor;
  let prevHead = "";
  let subStart = rowCursor;
  let prevSubKey = "";
  for (let i = 0; i < input.rows.length; i += 1) {
    const r = input.rows[i];
    const row = ws.getRow(rowCursor);
    row.getCell(1).value = r.headTopic;
    row.getCell(2).value = r.proportion;
    row.getCell(3).value = r.subTopic;
    row.getCell(4).value = r.minScore;
    row.getCell(5).value = r.maxScore;
    row.getCell(6).value = r.grade ?? "-";
    row.getCell(7).value = r.criteriaDetail ?? "";
    row.getCell(8).value = r.isFirstOfSub ? (r.selfScore ?? "") : "";
    row.getCell(9).value = r.isFirstOfSub ? (r.selfDetail ?? "") : "";
    row.getCell(10).value = r.isFirstOfSub ? (r.managerScore ?? "") : "";
    row.getCell(11).value = r.isFirstOfSub ? (r.managerDetail ?? "") : "";

    for (let c = 1; c <= 11; c += 1) {
      const cell = row.getCell(c);
      cell.border = thinBorder;
      cell.alignment = {
        vertical: "top",
        horizontal: c === 2 || c === 4 || c === 5 || c === 6 || c === 8 || c === 10 ? "center" : "left",
        wrapText: true,
      };
    }

    if (i === 0) {
      prevHead = r.headTopic;
      headStart = rowCursor;
      prevSubKey = r.subKey;
      subStart = rowCursor;
    } else if (r.headTopic !== prevHead) {
      if (rowCursor - 1 > headStart) {
        ws.mergeCells(headStart, 1, rowCursor - 1, 1);
        ws.mergeCells(headStart, 2, rowCursor - 1, 2);
      }
      prevHead = r.headTopic;
      headStart = rowCursor;
    }

    if (i !== 0 && r.subKey !== prevSubKey) {
      if (rowCursor - 1 > subStart) {
        ws.mergeCells(subStart, 3, rowCursor - 1, 3);
        ws.mergeCells(subStart, 8, rowCursor - 1, 8);
        ws.mergeCells(subStart, 9, rowCursor - 1, 9);
        ws.mergeCells(subStart, 10, rowCursor - 1, 10);
        ws.mergeCells(subStart, 11, rowCursor - 1, 11);
      }
      prevSubKey = r.subKey;
      subStart = rowCursor;
    }

    rowCursor += 1;
  }
  if (rowCursor - 1 > headStart) {
    ws.mergeCells(headStart, 1, rowCursor - 1, 1);
    ws.mergeCells(headStart, 2, rowCursor - 1, 2);
  }
  if (rowCursor - 1 > subStart) {
    ws.mergeCells(subStart, 3, rowCursor - 1, 3);
    ws.mergeCells(subStart, 8, rowCursor - 1, 8);
    ws.mergeCells(subStart, 9, rowCursor - 1, 9);
    ws.mergeCells(subStart, 10, rowCursor - 1, 10);
    ws.mergeCells(subStart, 11, rowCursor - 1, 11);
  }

  const summaryRows = input.rows.filter((r) => r.isFirstOfSub);
  const selfTotal = summaryRows.reduce(
    (sum, r) => sum + (r.selfScore ?? 0),
    0,
  );
  const managerTotal = summaryRows.reduce(
    (sum, r) => sum + (r.managerScore ?? 0),
    0,
  );

  const totalRow = ws.getRow(rowCursor);
  ws.mergeCells(rowCursor, 1, rowCursor, 7);
  totalRow.getCell(1).value = "คะแนนรวมทั้งหมด";
  totalRow.getCell(1).font = { bold: true };
  totalRow.getCell(1).alignment = { horizontal: "right", vertical: "middle" };
  totalRow.getCell(8).value = selfTotal;
  totalRow.getCell(8).font = { bold: true };
  totalRow.getCell(8).alignment = { horizontal: "center", vertical: "middle" };
  totalRow.getCell(10).value = managerTotal;
  totalRow.getCell(10).font = { bold: true };
  totalRow.getCell(10).alignment = { horizontal: "center", vertical: "middle" };

  for (let c = 1; c <= 11; c += 1) {
    const cell = totalRow.getCell(c);
    cell.border = thinBorder;
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF7F7F7" },
    };
  }
  rowCursor += 1;

  for (let r = 1; r <= rowCursor; r += 1) {
    if (r <= 3) {
      ws.getRow(r).height = 22;
    } else if (r === 6 || r === 7) {
      ws.getRow(r).height = 26;
    }
  }

  return Buffer.from(await wb.xlsx.writeBuffer());
}
