"use client";

import { fetchPems01Table } from "@/api/pe/pems01/fetch_table";
import type { Pems01TablePayload } from "@/api/pe/pems01/fetch_table";
import { ErpAlert, ErpTableSkeleton } from "@/components/erp";
import { Pems01TemplateTable } from "@/components/pe/tables/Pems01TemplateTable";
import type { RoundListFilter } from "@/lib/round-list-filter";
import { useEffect, useState, useTransition } from "react";

type Props = {
  filter: RoundListFilter;
  loading?: boolean;
};

export function Pems01TableBlock({ filter, loading }: Props) {
  const [data, setData] = useState<Pems01TablePayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fetching, startFetch] = useTransition();

  useEffect(() => {
    let cancelled = false;
    startFetch(async () => {
      try {
        const result = await fetchPems01Table(filter);
        if (!cancelled) {
          setData(result);
          setError(null);
        }
      } catch (e) {
        console.error("Pems01TableBlock", e);
        if (!cancelled) {
          setError("ไม่สามารถโหลดรายการรอบประเมินได้");
          setData(null);
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [filter]);

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
      <Pems01TemplateTable
        rows={data.rows}
        hasFilter={data.hasFilter}
        totalCount={data.totalCount}
      />
    </div>
  );
}
