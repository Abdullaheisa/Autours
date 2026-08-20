"use client";

import { Download, Info } from "lucide-react";

interface DownloadTemplateProps {
  onDownload: () => void;
}

export default function DownloadTemplate({ onDownload }: DownloadTemplateProps) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
          <Info size={20} className="text-blue-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-blue-900">
            Need a template?
          </h3>
          <p className="text-xs text-blue-700 mt-0.5">
            Download our Excel template with all required columns and sample data.
          </p>
        </div>
      </div>
      <button
        onClick={onDownload}
        className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-medium transition-colors shadow-sm shrink-0"
      >
        <Download size={16} />
        Download Template
      </button>
    </div>
  );
}
