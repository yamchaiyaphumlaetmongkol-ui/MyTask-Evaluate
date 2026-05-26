import { ErpDataTable, type ErpColumn } from "@/components/erp";
import type { ReactNode } from "react";

/** @deprecated ใช้ `ErpDataTable` จาก `@/components/erp` แทน — ดู docs/UI-STANDARDS.md */
export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  headerClassName?: string;
}

/** @deprecated ใช้ `ErpDataTable` จาก `@/components/erp` แทน */
export interface BaseTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  striped?: boolean;
  hover?: boolean;
}

/** @deprecated ใช้ `ErpDataTable` จาก `@/components/erp` แทน */
export function BaseTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage,
  striped,
  hover,
}: BaseTableProps<T>) {
  const erpColumns: ErpColumn<T>[] = columns.map((col) => ({
    ...col,
    render: (row, _index) => col.render(row),
  }));

  return (
    <ErpDataTable
      columns={erpColumns}
      data={data}
      rowKey={keyExtractor}
      emptyMessage={emptyMessage}
      striped={striped}
      hover={hover}
    />
  );
}
