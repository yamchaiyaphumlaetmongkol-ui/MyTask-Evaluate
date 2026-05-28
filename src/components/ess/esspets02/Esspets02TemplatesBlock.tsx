"use client";

import { fetchEsspets02Templates } from "@/api/ess/esspets02/fetch_templates";
import type { TemplateOption } from "@/api/ess/esspets02/types";
import { ErpAlert, ErpTableSkeleton } from "@/components/erp";
import { SelfEvalLauncher } from "@/components/ess/SelfEvalLauncher";
import type { RoundListFilter } from "@/lib/round-list-filter";
import { useEffect, useState, useTransition } from "react";

type Props = {
  filter: RoundListFilter;
  loading?: boolean;
  refreshSignal?: unknown;
  templateId: string;
  employeeCode: string;
};

export function Esspets02TemplatesBlock({
  filter,
  loading,
  refreshSignal,
  templateId,
  employeeCode,
}: Props) {
  const [templates, setTemplates] = useState<TemplateOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [fetching, startFetch] = useTransition();

  useEffect(() => {
    let cancelled = false;
    startFetch(async () => {
      try {
        const rows = await fetchEsspets02Templates(filter);
        if (!cancelled) {
          setTemplates(rows);
          setError(null);
        }
      } catch (e) {
        console.error("Esspets02TemplatesBlock", e);
        if (!cancelled) {
          setError("ไม่สามารถโหลดรายการแบบประเมินได้");
          setTemplates([]);
        }
      }
    });
    return () => {
      cancelled = true;
    };
  }, [filter, refreshSignal]);

  if (error) {
    return <ErpAlert>{error}</ErpAlert>;
  }

  if ((loading || fetching) && templates.length === 0) {
    return <ErpTableSkeleton rows={4} columns={3} />;
  }

  return (
    <SelfEvalLauncher
      templates={templates}
      session={null}
      templateId={templateId}
      employeeCode={employeeCode}
    />
  );
}
