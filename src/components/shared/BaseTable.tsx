import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
}

export interface BaseTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  striped?: boolean;
  hover?: boolean;
}

export function BaseTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "ไม่มีข้อมูล",
  striped = true,
  hover = true,
}: BaseTableProps<T>) {
  return (
    <div className="table-responsive">
      <table
        className={cn(
          "table align-middle mb-0",
          striped && "table-striped",
          hover && "table-hover",
        )}
      >
        <thead className="table-light">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={col.className}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center text-muted py-4">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={keyExtractor(row)}>
                {columns.map((col) => (
                  <td key={col.key} className={col.className}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
