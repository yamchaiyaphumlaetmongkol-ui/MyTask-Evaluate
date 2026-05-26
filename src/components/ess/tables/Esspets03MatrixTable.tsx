import type { EvaluationStatusHeadBlock } from "@/api/ess/esspets03/types";
import { ResultTextCell } from "@/components/shared/ResultTextCell";
import { cn } from "@/lib/utils";
import { Fragment } from "react";

type Props = {
  heads: EvaluationStatusHeadBlock[];
};

function fmtScore(value: number | null) {
  return value != null ? String(value) : "—";
}

const COL_COUNT = 6;

export function Esspets03MatrixTable({ heads }: Props) {
  const totalSubs = heads.reduce((n, h) => n + h.subs.length, 0);

  if (totalSubs === 0) {
    return (
      <p className="text-muted text-center py-4 mb-0">
        แบบประเมินนี้ยังไม่มีหัวข้อย่อย
      </p>
    );
  }

  let globalSeq = 0;

  return (
    <div className="table-responsive erp-esspets03-detail__table-scroll">
      <table className="table table-bordered align-middle mb-0 erp-eval-matrix">
        <thead className="erp-table-head">
          <tr>
            <th
              className="erp-eval-matrix__col-seq text-center"
              rowSpan={2}
            >
              ลำดับ
            </th>
            <th className="erp-eval-matrix__col-topic" rowSpan={2}>
              หัวข้อย่อย
            </th>
            <th className="text-center" colSpan={2}>
              ประเมินตนเอง
            </th>
            <th className="text-center" colSpan={2}>
              ประเมินพนักงาน
            </th>
          </tr>
          <tr>
            <th className="erp-eval-matrix__col-score text-center">คะแนน</th>
            <th className="erp-eval-matrix__col-reason">เหตุผล</th>
            <th className="erp-eval-matrix__col-score text-center">คะแนน</th>
            <th className="erp-eval-matrix__col-reason">เหตุผล</th>
          </tr>
        </thead>
        <tbody>
          {heads.map((head) => (
            <Fragment key={head.headId}>
              <tr className="erp-eval-matrix__head-row">
                <td colSpan={COL_COUNT}>
                  หัวข้อประเมินหลัก: {head.headTopic}
                </td>
              </tr>
              {head.subs.map((sub) => {
                globalSeq += 1;
                const alt = globalSeq % 2 === 0;
                return (
                  <tr
                    key={sub.subId}
                    className={cn(
                      "erp-eval-matrix__data-row",
                      alt && "erp-eval-matrix__data-row--alt",
                    )}
                  >
                    <td className="erp-eval-matrix__col-seq text-center">
                      {globalSeq}
                    </td>
                    <td className="erp-eval-matrix__col-topic">
                      {sub.subTopic}
                    </td>
                    <td className="erp-eval-matrix__col-score text-center">
                      {fmtScore(sub.selfScore)}
                    </td>
                    <td className="erp-eval-matrix__col-reason">
                      <ResultTextCell
                        text={sub.selfDetail}
                        className="erp-eval-matrix__reason-text"
                      />
                    </td>
                    <td className="erp-eval-matrix__col-score text-center">
                      {fmtScore(sub.managerScore)}
                    </td>
                    <td className="erp-eval-matrix__col-reason">
                      <ResultTextCell
                        text={sub.managerDetail}
                        className="erp-eval-matrix__reason-text"
                      />
                    </td>
                  </tr>
                );
              })}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}
