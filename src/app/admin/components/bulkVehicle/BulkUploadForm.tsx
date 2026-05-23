"use client";

import { useState, useRef } from "react";
import { Upload, FileSpreadsheet, Building2, Store, ChevronDown } from "lucide-react";

interface BulkUploadFormProps {
  suppliers: string[];
  branches: string[];
  onUpload: (supplier: string, branch: string, file: File) => void;
}

export default function BulkUploadForm({ suppliers, branches, onUpload }: BulkUploadFormProps) {
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.xlsx') || droppedFile.name.endsWith('.xls') || droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (selectedSupplier && selectedBranch && file) {
      onUpload(selectedSupplier, selectedBranch, file);
    }
  };

  const isFormValid = selectedSupplier && selectedBranch && file;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 lg:p-6">
      {/* Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Supplier */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Suppliers</label>
          <div className="relative">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="">Select Supplier...</option>
              {suppliers.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* Branch */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Branches</label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="">Select Branch...</option>
              {branches.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Upload Excel File</label>
          <div className="relative">
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              onClick={() => inputRef.current?.click()}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <Upload size={16} />
              {file ? file.name : "No file chosen"}
            </button>
          </div>
        </div>
      </div>

      {/* Drag & Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? "border-primary-500 bg-primary-50"
            : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
        }`}
      >
        <FileSpreadsheet size={32} className={`mx-auto mb-3 transition-colors ${dragActive ? "text-primary-500" : "text-gray-300"}`} />
        <p className="text-sm font-medium text-gray-600">
          Drop Excel file here or <span className="text-primary-600">click to browse</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">Supports .xlsx, .xls, .csv</p>
      </div>

      {/* Selected File */}
      {file && (
        <div className="mt-4 flex items-center gap-3 p-3 bg-primary-50 border border-primary-100 rounded-xl">
          <FileSpreadsheet size={20} className="text-primary-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFile(null);
            }}
            className="text-xs text-red-600 hover:text-red-700 font-medium"
          >
            Remove
          </button>
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-5 flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={!isFormValid}
          className="bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary-200 flex items-center gap-2"
        >
          <Upload size={16} />
          Upload Excel
        </button>
      </div>
    </div>
  );
}
