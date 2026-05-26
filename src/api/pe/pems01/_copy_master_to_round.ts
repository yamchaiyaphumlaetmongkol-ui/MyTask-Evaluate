import type { Prisma } from "@prisma/client";
import {
  buildPermissionRows,
  selectionFromPermissionRows,
} from "@/api/pe/pems01/_permission";

type Tx = Prisma.TransactionClient;

/** คัดลอกโครงสร้างแม่แบบ → หัวข้อรอบประเมิน (snapshot) */
export async function copyMasterBlueprintToRound(
  tx: Tx,
  masterId: bigint,
  roundId: bigint,
): Promise<void> {
  const blueprintHeads = await tx.peEvaluationMasterHead.findMany({
    where: { masterId, active: true },
    orderBy: { id: "asc" },
    include: {
      subs: { where: { active: true }, orderBy: { id: "asc" } },
    },
  });

  for (const bh of blueprintHeads) {
    const createdHead = await tx.peEvaluationHead.create({
      data: {
        peEvaluationRound: roundId,
        headTopic: bh.headTopic,
        proportion: bh.proportion,
        createdBy: null,
      },
    });

    const masterPermRows = await tx.peEvaluationPermission.findMany({
      where: { entityType: "head", entityId: bh.id },
      select: {
        permissionType: true,
        targetType: true,
        targetCode: true,
        isAll: true,
      },
    });
    const perm = selectionFromPermissionRows(masterPermRows);
    const permRows = buildPermissionRows("head", createdHead.id, perm);
    if (permRows.length > 0) {
      await tx.peEvaluationPermission.createMany({ data: permRows });
    }

    for (const bs of bh.subs) {
      await tx.peEvaluationSub.create({
        data: {
          peEvaluationHead: createdHead.id,
          subTopic: bs.subTopic,
          minScore: bs.minScore,
          maxScore: bs.maxScore,
          gradeCriteria: bs.gradeCriteria as Prisma.InputJsonValue,
          createdBy: null,
        },
      });
    }
  }
}
