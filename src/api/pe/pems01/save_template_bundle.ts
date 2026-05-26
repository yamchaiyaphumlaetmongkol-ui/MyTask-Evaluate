"use server";

import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import { buildPermissionRows, replacePermissions } from "@/api/pe/pems01/_permission";
import type { TopicPermissionSelection } from "@/api/pe/pems01/types";
import {
  gradeCriteriaToJson,
  scoreRangeFromCriteria,
} from "@/lib/grade-criteria";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const PermissionSchema = z.object({
  editAllRoles: z.boolean(),
  editAllPositions: z.boolean(),
  evaluateAllRoles: z.boolean(),
  evaluateAllPositions: z.boolean(),
  editRoleCodes: z.array(z.string()),
  editPositionCodes: z.array(z.string()),
  evaluateRoleCodes: z.array(z.string()),
  evaluatePositionCodes: z.array(z.string()),
});

const GradeCriterionSchema = z.object({
  detailTopic: z.string().min(1, "กรุณากรอกหัวข้อเกณฑ์"),
  minScore: z.coerce.number().min(0),
  maxScore: z.coerce.number().min(0),
  grade: z.string().max(20).optional().default(""),
}).refine((d) => d.minScore <= d.maxScore, {
  message: "คะแนนต่ำสุดต้องไม่เกินคะแนนสูงสุด",
});

const SubSchema = z.object({
  id: z.string().optional(),
  subTopic: z.string().min(1, "กรุณากรอกหัวข้อย่อย"),
  details: z.array(GradeCriterionSchema).default([]),
});

const HeadSchema = z.object({
  id: z.string().optional(),
  headTopic: z.string().min(1, "กรุณากรอกหัวข้อประเมินหลัก"),
  proportion: z.coerce.number().min(0).max(100).default(0),
  permissions: PermissionSchema,
  subs: z.array(SubSchema).default([]),
});

const BundleSchema = z
  .object({
    templateId: z.string().optional(),
    templateName: z.string().min(1, "กรุณากรอกชื่อแบบประเมิน"),
    evaluationPeriod: z.enum(["H1", "H2"], {
      message: "กรุณาเลือกช่วงประเมิน (ครึ่งแรก/ครึ่งหลัง)",
    }),
    startDate: z.string().min(1, "กรุณาระบุวันเริ่ม"),
    endDate: z.string().min(1, "กรุณาระบุวันสิ้นสุด"),
    heads: z.array(HeadSchema).min(1, "ต้องมีหัวข้อประเมินหลักอย่างน้อย 1 รายการ"),
  })
  .refine((d) => d.startDate <= d.endDate, {
    message: "วันเริ่มต้องไม่เกินวันสิ้นสุด",
    path: ["endDate"],
  });

function parseFormDate(value: string): Date {
  return new Date(`${value.trim()}T12:00:00.000Z`);
}

export async function saveEvaluationTemplateBundle(
  raw: unknown,
): Promise<ActionResult<{ templateId: string; roundId: string; headIds: string[] }>> {
  const parsed = BundleSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  }

  const { templateId, templateName, evaluationPeriod, startDate, endDate, heads } =
    parsed.data;

  if (!templateId) {
    return fail(
      "ใช้บันทึกแม่แบบที่เมนูแม่แบบ หรือสร้างรอบใหม่ — ไม่สร้างรอบจากหน้านี้โดยตรง",
    );
  }

  const roundPk = BigInt(templateId);
  const year = parseFormDate(startDate).getUTCFullYear();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const round = await tx.peEvaluationRound.findUnique({
        where: { id: roundPk },
      });
      if (!round?.active) {
        throw new Error("ROUND_NOT_FOUND");
      }
      if (round.status === "closed") {
        throw new Error("ROUND_CLOSED");
      }

      await tx.peEvaluationRound.update({
        where: { id: roundPk },
        data: {
          roundName: templateName.trim(),
          evaluationPeriod,
          evaluationYear: year,
          startDate: parseFormDate(startDate),
          endDate: parseFormDate(endDate),
        },
      });

      const templatePk = roundPk;

      const savedHeadIds: string[] = [];

      for (const head of heads) {
        const perm = head.permissions as TopicPermissionSelection;
        let headId: bigint;

        if (head.id) {
          headId = BigInt(head.id);
          await tx.peEvaluationHead.update({
            where: { id: headId },
            data: {
              peEvaluationRound: templatePk,
              headTopic: head.headTopic.trim(),
              proportion: head.proportion,
            },
          });
          await replacePermissions(tx, "head", headId, perm);
        } else {
          const created = await tx.peEvaluationHead.create({
            data: {
              peEvaluationRound: templatePk,
              headTopic: head.headTopic.trim(),
              proportion: head.proportion,
              createdBy: null,
            },
          });
          headId = created.id;
          const permRows = buildPermissionRows("head", headId, perm);
          if (permRows.length > 0) {
            await tx.peEvaluationPermission.createMany({ data: permRows });
          }
        }

        for (const sub of head.subs) {
          const criteria = gradeCriteriaToJson(sub.details);
          const range = scoreRangeFromCriteria(criteria);
          const subData = {
            subTopic: sub.subTopic.trim(),
            gradeCriteria: criteria,
            minScore: range.minScore,
            maxScore: range.maxScore,
          };

          if (sub.id) {
            await tx.peEvaluationSub.update({
              where: { id: BigInt(sub.id) },
              data: subData,
            });
          } else {
            await tx.peEvaluationSub.create({
              data: {
                peEvaluationHead: headId,
                createdBy: null,
                ...subData,
              },
            });
          }
        }

        savedHeadIds.push(String(headId));
      }

      return {
        templateId: String(templatePk),
        roundId: String(templatePk),
        headIds: savedHeadIds,
      };
    });

    revalidatePath("/pe/pems01");
    revalidatePath("/pe/pems01/form");

    return ok(result);
  } catch (e) {
    if (e instanceof Error && e.message === "ROUND_NOT_FOUND") {
      return fail("ไม่พบรอบประเมิน");
    }
    if (e instanceof Error && e.message === "ROUND_CLOSED") {
      return fail("รอบนี้ปิดแล้ว — แก้โครงสร้างไม่ได้");
    }
    console.error("saveEvaluationTemplateBundle", e);
    return fail("บันทึกรอบประเมินไม่สำเร็จ");
  }
}
