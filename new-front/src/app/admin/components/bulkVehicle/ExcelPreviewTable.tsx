"use client";

import { FileSpreadsheet, AlertCircle } from "lucide-react";

export interface ExcelRow {
  id: number;
  vehicleName: string;
  category: string;
  dailyPrice: number;
  status: "valid" | "invalid" | "pending";
  error?: string;
}

interface ExcelPreviewTableProps {
  data: ExcelRow[];
  fileName?: string;
}

export default function ExcelPreviewTable({ data, fileName }: ExcelPreviewTableProps) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileSpreadsheet className="text-gray-400" size={28} />
        </div>
        <h3 className="text-base font-semibold text-gray-900">Excel Preview</h3>
        <p className="text-sm text-gray-500 mt-1">Upload an Excel file to see preview</p>
        <div className="mt-4 inline-flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-4 py-2 rounded-lg">
          <AlertCircle size={14} />
          No Data
        </div>
      </div>
    );
  }

  const validCount = data.filter((r) => r.status === "valid").length;
  const invalidCount = data.filter((r) => r.status === "invalid").length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-gray-900">Excel Preview</h3>
          {fileName && (
            <p className="text-xs text-gray-500 mt-0.5">{fileName}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
            {validCount} Valid
          </span>
          {invalidCount > 0 && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
              {invalidCount} Invalid
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px]">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3 w-16">#</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3">Vehicle Name</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3">Category</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3">Daily Price</th>
              <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 sm:px-5 py-3 w-24">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, index) => (
              <tr
                key={row.id}
                className={`hover:bg-gray-50/50 transition-colors ${
                  row.status === "invalid" ? "bg-red-50/30" : ""
                }`}
              >
                <td className="px-4 sm:px-5 py-3">
                  <span className="text-xs text-gray-400 font-mono">{index + 1}</span>
                </td>
                <td className="px-4 sm:px-5 py-3">
                  <p className="text-sm font-medium text-gray-900">{row.vehicleName}</p>
                  {row.error && (
                    <p className="text-xs text-red-500 mt-0.5">{row.error}</p>
                  )}
                </td>
                <td className="px-4 sm:px-5 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                    {row.category}
                  </span>
                </td>
                <td className="px-4 sm:px-5 py-3">
                  <span className="text-sm font-semibold text-gray-900">
                    ${row.dailyPrice.toLocaleString()}
                  </span>
                </td>
                <td className="px-4 sm:px-5 py-3">
                  {row.status === "valid" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Valid
                    </span>
                  ) : row.status === "invalid" ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-full text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                      Invalid
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Pending
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-gray-50/30">
        <p className="text-xs text-gray-500">
          Total rows: <span className="font-medium text-gray-900">{data.length}</span>
        </p>
      </div>
    </div>
  );
}
