"use server";

import { fail, ok, type ActionResult } from "@/api/_shared/action-result";
import {
  buildPermissionRows,
  replacePermissions,
} from "@/api/pe/pems01/_permission";
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
  detailTopic: z.string().min(1),
  minScore: z.coerce.number().min(0),
  maxScore: z.coerce.number().min(0),
  grade: z.string().max(20).optional().default(""),
});

const SubSchema = z.object({
  id: z.string().optional(),
  subTopic: z.string().min(1),
  details: z.array(GradeCriterionSchema).default([]),
});

const HeadSchema = z.object({
  id: z.string().optional(),
  headTopic: z.string().min(1),
  proportion: z.coerce.number().min(0).max(100).default(0),
  permissions: PermissionSchema,
  subs: z.array(SubSchema).default([]),
});

const MasterBlueprintSchema = z.object({
  masterId: z.string().optional(),
  masterName: z.string().min(1),
  description: z.string().optional().default(""),
  heads: z.array(HeadSchema).min(1),
});

/** บันทึกแม่แบบ (โครงสร้างคำถาม/สิทธิ์) — ไม่กระทบรอบที่ปิดแล้ว */
export async function saveMasterBlueprint(
  raw: unknown,
): Promise<ActionResult<{ masterId: string }>> {
  const parsed = MasterBlueprintSchema.safeParse(raw);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง");
  }

  const { masterId, masterName, description, heads } = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      let masterPk: bigint;

      if (masterId) {
        masterPk = BigInt(masterId);
        await tx.peEvaluationTemplateMaster.update({
          where: { id: masterPk },
          data: {
            masterName: masterName.trim(),
            description: description.trim() || null,
          },
        });
      } else {
        const created = await tx.peEvaluationTemplateMaster.create({
          data: {
            masterName: masterName.trim(),
            description: description.trim() || null,
          },
        });
        masterPk = created.id;
      }

      for (const head of heads) {
        const perm = head.permissions as TopicPermissionSelection;
        let headId: bigint;

        if (head.id) {
          headId = BigInt(head.id);
          await tx.peEvaluationMasterHead.update({
            where: { id: headId },
            data: {
              masterId: masterPk,
              headTopic: head.headTopic.trim(),
              proportion: head.proportion,
            },
          });
          await replacePermissions(tx, "head", headId, perm);
        } else {
          const created = await tx.peEvaluationMasterHead.create({
            data: {
              masterId: masterPk,
              headTopic: head.headTopic.trim(),
              proportion: head.proportion,
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
            await tx.peEvaluationMasterSub.update({
              where: { id: BigInt(sub.id) },
              data: subData,
            });
          } else {
            await tx.peEvaluationMasterSub.create({
              data: { masterHeadId: headId, ...subData },
            });
          }
        }
      }

      return { masterId: String(masterPk) };
    });

    revalidatePath("/pe/pems01");
    revalidatePath("/pe/pems01/master/form");

    return ok(result);
  } catch (e) {
    console.error("saveMasterBlueprint", e);
    return fail("บันทึกแม่แบบไม่สำเร็จ");
  }
}
