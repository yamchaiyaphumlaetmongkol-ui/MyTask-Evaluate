import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export type ErpColumn<T> = {
  key: string;
  header: string;
  render: (row: T, index: number) => ReactNode;
  className?: string;
  headerClassName?: string;
};

export type ErpDataTableProps<T> = {
  columns: ErpColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  showIndex?: boolean;
  indexHeader?: string;
  footer?: ReactNode;
  striped?: boolean;
  hover?: boolean;
  className?: string;
};

/** ตาราง list มาตรฐ — thead erp-table-head */
export function ErpDataTable<T>({
  columns,
  data,
  rowKey,
  emptyMessage = "ไม่มีข้อมูล",
  showIndex = false,
  indexHeader = "ลำดับ",
  footer,
  striped = true,
  hover = true,
  className,
}: ErpDataTableProps<T>) {
  const allColumns = showIndex
    ? [
        {
          key: "__index",
          header: indexHeader,
          headerClassName: "text-center",
          className: "text-center",
          render: (_row: T, index: number) => index + 1,
        } as ErpColumn<T>,
        ...columns,
      ]
    : columns;

  if (data.length === 0) {
    return (
      <>
        <p className="text-muted text-center py-4 mb-0">{emptyMessage}</p>
        {footer ? <div className="mt-2">{footer}</div> : null}
      </>
    );
  }

  return (
    <>
      <div className={cn("table-responsive", className)}>
        <table
          className={cn(
            "table align-middle mb-0",
            striped && "table-striped",
            hover && "table-hover",
          )}
        >
          <thead className="erp-table-head">
            <tr>
              {allColumns.map((col) => (
                <th key={col.key} className={col.headerClassName}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={rowKey(row)}>
                {allColumns.map((col) => (
                  <td key={col.key} className={col.className}>
                    {col.render(row, index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer ? <div className="mt-2">{footer}</div> : null}
    </>
  );
}
