"use server";

import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import { parseEvaluationTemplateExcel } from "@/lib/excel/parse-evaluation-template";
import { z } from "zod";

const ParseSchema = z.object({
  fileBase64: z.string().min(1),
  selectedSheet: z.string().optional(),
  selectedPeriod: z.enum(["H1", "H2"], {
    message: "กรุณาเลือกช่วงประเมิน (H1/H2)",
  }),
  enforceHeadProportion100: z.boolean().optional(),
});

export async function parseEvaluationTemplateExcelAction(
  raw: unknown,
): Promise<ActionResult<Awaited<ReturnType<typeof parseEvaluationTemplateExcel>>>> {
  const parsed = ParseSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ข้อมูลไฟล์ไม่ถูกต้อง");
  }
  try {
    const input = parsed.data;
    const fileBuffer = Buffer.from(input.fileBase64, "base64");
    const arrayBuffer = fileBuffer.buffer.slice(
      fileBuffer.byteOffset,
      fileBuffer.byteOffset + fileBuffer.byteLength,
    ) as ArrayBuffer;
    const result = await parseEvaluationTemplateExcel({
      file: arrayBuffer,
      selectedSheet: input.selectedSheet,
      selectedPeriod: input.selectedPeriod,
      enforceHeadProportion100: input.enforceHeadProportion100,
    });
    return ok(result);
  } catch (e) {
    console.error("parseEvaluationTemplateExcelAction", e);
    return fail("อ่านไฟล์ Excel ไม่สำเร็จ");
  }
}
