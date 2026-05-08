"use client";

import { ReactNode } from "react";

interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => ReactNode;
  hidden?: "sm" | "md" | "lg";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
}

export default function DataTable<T>({ columns, data, keyExtractor }: DataTableProps<T>) {
  const getHiddenClass = (hidden?: "sm" | "md" | "lg") => {
    switch (hidden) {
      case "sm": return "hidden sm:table-cell";
      case "md": return "hidden md:table-cell";
      case "lg": return "hidden lg:table-cell";
      default: return "";
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="bg-gray-50/50">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3 ${getHiddenClass(col.hidden)}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data.map((item) => (
            <tr key={keyExtractor(item)} className="hover:bg-gray-50/50 transition-colors">
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 sm:px-5 py-3 ${getHiddenClass(col.hidden)}`}
                >
                  {col.cell(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
