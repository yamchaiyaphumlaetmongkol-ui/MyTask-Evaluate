"use client";

import { fetchEsspets04Table } from "@/api/ess/esspets04/fetch_table";
import type { Esspets04TablePayload } from "@/api/ess/esspets04/fetch_table";
import { ErpAlert, ErpTableSkeleton } from "@/components/erp";
import { Esspets04QueueTable } from "@/components/ess/tables/Esspets04QueueTable";
import type { ManagerEvalQueueFilter } from "@/lib/manager-eval-queue-filter";
import { managerEvalFilterSearchKey } from "@/lib/filter-search-key";
import { useEffect, useMemo, useState, useTransition } from "react";

type Props = {
  managerCode: string;
  filter: ManagerEvalQueueFilter;
  loading?: boolean;
};

export function Esspets04TableBlock({ managerCode, filter, loading }: Props) {
  const [data, setData] = useState<Esspets04TablePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetching, startFetch] = useTransition();

  const filterKey = useMemo(
    () => managerEvalFilterSearchKey(managerCode, filter),
    [managerCode, filter],
  );

  useEffect(() => {
    setData(null);
    if (!managerCode) {
      return;
    }
    let cancelled = false;
    startFetch(async () => {
      try {
        const result = await fetchEsspets04Table(managerCode, filter);
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (e) {
        console.error("Esspets04TableBlock", e);
        if (!cancelled) {
          setError("ไม่สามารถโหลดรายการคิวประเมินได้");
          setData(null);
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [managerCode, filterKey]);

  if (!managerCode) {
    return (
      <p className="text-muted text-center py-4 mb-0">เลือกผู้ใช้งานก่อน</p>
    );
  }

  if (loading && !data) {
    return <ErpTableSkeleton columns={8} />;
  }

  if (error) {
    return <ErpAlert>{error}</ErpAlert>;
  }

  if ((fetching || loading) && !data) {
    return <ErpTableSkeleton columns={8} />;
  }

  if (!data) {
    return <ErpTableSkeleton columns={8} />;
  }

  return (
    <div className={fetching ? "erp-table-block--loading" : undefined}>
      <Esspets04QueueTable
        rows={data.rows}
        managerCode={managerCode}
        filter={filter}
      />
    </div>
  );
}
