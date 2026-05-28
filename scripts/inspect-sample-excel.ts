import { Workbook } from "exceljs";
import { readEvaTemplateArrayBuffer } from "@/lib/excel/eva-template-file";

function cellText(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v).trim();
  if (typeof v === "object" && v && "richText" in v) {
    return (v as { richText: Array<{ text: string }> }).richText
      .map((x) => x.text)
      .join("")
      .trim();
  }
  if (typeof v === "object" && v && "result" in v) {
    return cellText((v as { result: unknown }).result);
  }
  return String(v).trim();
}

async function main() {
  const wb = new Workbook();
  await wb.xlsx.load(readEvaTemplateArrayBuffer());
  const ws = wb.getWorksheet("66038") ?? wb.worksheets[0];
  console.log("sheet", ws.name, "rows", ws.rowCount);
  for (let r = 1; r <= 30; r += 1) {
    const row = ws.getRow(r);
    const parts: string[] = [];
    for (let c = 1; c <= 18; c += 1) {
      const t = cellText(row.getCell(c).value);
      if (t) parts.push(`${String.fromCharCode(64 + c)}:${t.slice(0, 50)}`);
    }
    if (parts.length) console.log(r, parts.join(" | "));
  }
}

void main();
