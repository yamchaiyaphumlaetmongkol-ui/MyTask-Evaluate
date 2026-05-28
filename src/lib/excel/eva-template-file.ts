import { readFileSync } from "node:fs";
import path from "node:path";

/** ไฟล์ใน public/ — ใช้ URL นี้ดาวน์โหลด (ปลอดภัยตอน deploy) */
export const EVA_TEMPLATE_FILENAME = "EVA_TEMPLATE.xlsx";
export const EVA_TEMPLATE_PUBLIC_URL = `/${EVA_TEMPLATE_FILENAME}`;

/** path บนเครื่อง — ใช้ใน scripts/tests เท่านั้น (อ้างจาก process.cwd()) */
export function getEvaTemplateFilePath(): string {
  return path.join(process.cwd(), "public", EVA_TEMPLATE_FILENAME);
}

export function readEvaTemplateBuffer(): Buffer {
  return readFileSync(getEvaTemplateFilePath());
}

export function readEvaTemplateArrayBuffer(): ArrayBuffer {
  const buf = readEvaTemplateBuffer();
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}
