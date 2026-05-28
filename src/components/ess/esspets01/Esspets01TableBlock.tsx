"use client";

import { fetchEsspets01Table } from "@/api/ess/esspets01/fetch_table";
import type { Esspets01TablePayload } from "@/api/ess/esspets01/fetch_table";
import { ErpAlert, ErpTableSkeleton } from "@/components/erp";
import { Esspets01TemplateTable } from "@/components/ess/tables/Esspets01TemplateTable";
import { useStoreHydrated } from "@/hooks/useStoreHydrated";
import type { RoundListFilter } from "@/lib/round-list-filter";
import { useCurrentUserStore } from "@/store/currentUserStore";
import { useEffect, useState, useTransition } from "react";

type Props = {
  filter: RoundListFilter;
  loading?: boolean;
};

export function Esspets01TableBlock({ filter, loading }: Props) {
  const hydrated = useStoreHydrated();
  const employeeCode = useCurrentUserStore((s) => s.employeeCode);
  const [data, setData] = useState<Esspets01TablePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetching, startFetch] = useTransition();

  useEffect(() => {
    if (!hydrated) return;
    let cancelled = false;
    startFetch(async () => {
      try {
        const result = await fetchEsspets01Table(
          filter,
          employeeCode ?? undefined,
        );
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (e) {
        console.error("Esspets01TableBlock", e);
        if (!cancelled) {
          setError("ไม่สามารถโหลดรายการแบบประเมินได้");
          setData(null);
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [filter, employeeCode, hydrated]);

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
      <Esspets01TemplateTable
        rows={data.rows}
        hasFilter={data.hasFilter}
        totalCount={data.totalCount}
      />
    </div>
  );
}
