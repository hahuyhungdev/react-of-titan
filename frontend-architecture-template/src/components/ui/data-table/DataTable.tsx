// components/ui/data-table — bảng GENERIC, pure UI.
// Không biết "invoice" hay "order". Features truyền columns + data (Scenario 9).
import type { ReactNode } from "react";
import "./data-table.css";

export type Column<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  emptyMessage?: string;
};

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  emptyMessage = "Không có dữ liệu",
}: DataTableProps<T>) {
  if (data.length === 0) {
    return <p className="ds-table__empty">{emptyMessage}</p>;
  }

  return (
    <table className="ds-table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th key={col.key}>{col.header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={getRowKey(row)}>
            {columns.map((col) => (
              <td key={col.key}>{col.render(row)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
