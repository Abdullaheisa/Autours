"use client";

import { useState, useEffect, useRef } from "react";
import {
  Upload, FileCheck, AlertTriangle, RefreshCw, CheckCircle2,
  FileSpreadsheet, Building2, Store, Download, ChevronDown
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsCard from "@/components/ui/StatsCard";
import { companyApi, vehicleManagementApi } from "@/services/api";
import { axiosClient } from "@/services/api/axiosClient";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import ExcelPreviewTable, { ExcelRow } from "@/app/admin/components/bulkVehicle/ExcelPreviewTable";

interface Supplier {
  id: number;
  name: string;
  company: string;
}

interface Branch {
  id: number;
  name: string;
  location: string;
}

export default function BulkVehicleUploadPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);
  const [previewData, setPreviewData] = useState<ExcelRow[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState("");

  // Load suppliers on mount
  useEffect(() => {
    setLoadingSuppliers(true);
    companyApi.getSuppliers()
      .then((res: any) => {
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setSuppliers(data);
      })
      .catch(() => toast.error("Failed to load suppliers"))
      .finally(() => setLoadingSuppliers(false));
  }, []);

  // Load branches when supplier changes (filtered by company_id)
  useEffect(() => {
    if (!selectedSupplierId) {
      setBranches([]);
      setSelectedBranchId("");
      return;
    }
    setLoadingBranches(true);
    setSelectedBranchId("");
    axiosClient.get("/get/branches", { params: { company_id: selectedSupplierId } })
      .then((res: any) => {
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setBranches(data);
      })
      .catch(() => toast.error("Failed to load branches"))
      .finally(() => setLoadingBranches(false));
  }, [selectedSupplierId]);

  // Template download - exactly like the old Vue project (blob download)
  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const response = await axiosClient.get("/vehicles/bulk-upload/template", {
        responseType: "blob",
      } as any);
      const url = window.URL.createObjectURL(new Blob([(response as any).data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "vehicles_bulk_upload_template.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Template downloaded successfully");
    } catch {
      toast.error("Failed to download template");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile?.name.match(/\.(xlsx|xls)$/i)) {
      setFile(droppedFile);
    } else {
      toast.error("Only .xlsx and .xls files are accepted");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  // Upload - exactly like old Vue: sends supplier ID + branch ID
  const handleUpload = async () => {
    if (!selectedSupplierId || !selectedBranchId || !file) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("supplier", selectedSupplierId);
      formData.append("branch", selectedBranchId);

      const res: any = await vehicleManagementApi.bulkUpload(formData);
      const vehicleCount = res?.data?.vehicles_imported || res?.data?.data?.vehicles_imported || 0;
      const message = res?.message || res?.data?.message || "Uploaded successfully";

      toast.success(`${message} (${vehicleCount} vehicles)`);

      // Show warnings if any
      const warnings = res?.warnings || res?.data?.warnings || [];
      warnings.forEach((w: any) => toast.error(w?.error || w, { duration: 8000 }));

      setUploadCount(prev => prev + vehicleCount);
      setUploadedFileName(file.name);

      // Build preview from response or fallback
      if (res?.data?.preview) {
        setPreviewData(res.data.preview);
      }

      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err: any) {
      const errData = err?.response?.data;
      const msg = errData?.message || "Upload failed";
      toast.error(msg, { duration: 5000 });
      const errors = errData?.errors || [];
      errors.forEach((e: any) => toast.error(e?.error || e, { duration: 8000 }));
    } finally {
      setIsUploading(false);
    }
  };

  const isFormValid = selectedSupplierId && selectedBranchId && file;
  const validRows = previewData.filter(r => r.status === "valid").length;
  const invalidRows = previewData.filter(r => r.status === "invalid").length;

  return (
    <SectionLayout>
      <PageHeader
        title="Visual Bulk Vehicle Upload"
        description="Upload multiple vehicles at once using the standard Excel template"
        showAction={false}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mt-6">
        <StatsCard label="Total Uploaded" value={uploadCount} icon={<Upload size={20} />} color="blue" />
        <StatsCard label="Valid Rows" value={validRows} icon={<FileCheck size={20} />} color="emerald" />
        <StatsCard className="col-span-2 sm:col-span-1" label="Errors" value={invalidRows} icon={<AlertTriangle size={20} />} color="red" />
      </div>

      {/* Download Template */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-6">
        <div>
          <p className="text-sm font-bold text-blue-900">📋 Need a template?</p>
          <p className="text-xs text-blue-700 mt-0.5">Download our Excel template with all required columns and sample data.</p>
        </div>
        <button
          type="button"
          onClick={handleDownloadTemplate}
          disabled={isDownloading}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white text-sm font-bold rounded-xl transition-all shadow-md shadow-emerald-200 shrink-0"
        >
          {isDownloading ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
          {isDownloading ? "Downloading..." : "Download Template"}
        </button>
      </div>

      {/* Upload Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 lg:p-6 space-y-5">
        <h3 className="text-base font-black text-gray-900">Upload Fleet Excel</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Supplier Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              <select
                value={selectedSupplierId}
                onChange={e => setSelectedSupplierId(e.target.value)}
                disabled={loadingSuppliers}
                className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none cursor-pointer disabled:opacity-60"
              >
                <option value="">{loadingSuppliers ? "Loading..." : "Select Supplier..."}</option>
                {suppliers.map(s => (
                  <option key={s.id} value={String(s.id)}>
                    {s.company || s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Branch Selector */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Branch</label>
            <div className="relative">
              <Store className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
              <select
                value={selectedBranchId}
                onChange={e => setSelectedBranchId(e.target.value)}
                disabled={!selectedSupplierId || loadingBranches}
                className="w-full pl-9 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none cursor-pointer disabled:opacity-60"
              >
                <option value="">
                  {!selectedSupplierId ? "Select supplier first" : loadingBranches ? "Loading..." : branches.length === 0 ? "No branches found" : "Select Branch..."}
                </option>
                {branches.map(b => (
                  <option key={b.id} value={String(b.id)}>
                    {b.name} {b.location ? `— ${b.location}` : ""}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>
        </div>

        {/* Drag & Drop Zone */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Excel File (.xlsx / .xls)</label>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            disabled={!selectedBranchId}
            className="hidden"
          />
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => selectedBranchId && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              !selectedBranchId
                ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                : dragActive
                ? "border-primary bg-primary/5 cursor-pointer"
                : "border-gray-300 hover:border-gray-400 bg-gray-50/50 cursor-pointer"
            }`}
          >
            <FileSpreadsheet size={36} className={`mx-auto mb-3 ${dragActive ? "text-primary" : "text-gray-300"}`} />
            {file ? (
              <div>
                <p className="text-sm font-bold text-gray-900 truncate">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                <button
                  onClick={e => { e.stopPropagation(); setFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                  className="mt-2 text-xs text-red-600 hover:underline font-medium"
                >
                  Remove file
                </button>
              </div>
            ) : (
              <>
                <p className="text-sm font-medium text-gray-600">
                  Drop Excel file here or <span className="text-primary font-bold">click to browse</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">Supports .xlsx and .xls only</p>
              </>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="button"
            disabled={!isFormValid || isUploading}
            onClick={handleUpload}
            className="flex items-center gap-2 px-8 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-black font-black text-sm rounded-xl transition-all shadow-lg shadow-primary/20 uppercase tracking-wider"
          >
            {isUploading ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                Uploading Fleet...
              </>
            ) : (
              <>
                <CheckCircle2 size={16} />
                Upload Excel
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preview Table */}
      <AnimatePresence>
        {previewData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ExcelPreviewTable data={previewData} fileName={uploadedFileName} />
          </motion.div>
        )}
      </AnimatePresence>
    </SectionLayout>
  );
}
