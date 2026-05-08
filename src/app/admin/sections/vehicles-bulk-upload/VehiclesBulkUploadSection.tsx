"use client";

import { useState } from "react";
import { Upload, FileCheck, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsCard from "@/components/ui/StatsCard";
import DownloadTemplate from "@/app/admin/components/bulkVehicle/DownloadTemplate";
import BulkUploadForm from "@/app/admin/components/bulkVehicle/BulkUploadForm";
import ExcelPreviewTable, { ExcelRow } from "@/app/admin/components/bulkVehicle/ExcelPreviewTable";

// Mock data - move to @/lib/data.ts
const suppliersData = ["Nile Motors", "MAHD Rent", "Autocar Elite", "Doha Wheels", "Kuwait Ride", "Jordan Cars", "Cairo Wheels"];
const branchesData = ["Hurghada International Airport", "Dubai Airport", "Riyadh Airport", "Doha Airport", "Kuwait City", "Amman Airport"];

const mockPreviewData: ExcelRow[] = [
  { id: 1, vehicleName: "Toyota Camry 2024", category: "Sedan", dailyPrice: 150, status: "valid" },
  { id: 2, vehicleName: "BMW X5", category: "SUV", dailyPrice: 350, status: "valid" },
  { id: 3, vehicleName: "Mercedes C-Class", category: "Luxury", dailyPrice: 450, status: "valid" },
  { id: 4, vehicleName: "", category: "SUV", dailyPrice: 0, status: "invalid", error: "Vehicle name is required" },
  { id: 5, vehicleName: "Nissan Patrol", category: "SUV", dailyPrice: 280, status: "valid" },
];

export default function BulkVehicleUploadPage() {
  const [previewData, setPreviewData] = useState<ExcelRow[]>([]);
  const [uploadedFileName, setUploadedFileName] = useState<string>("");
  const [uploadCount, setUploadCount] = useState(0);

  const handleDownloadTemplate = () => {
    // TODO: Generate and download Excel template
    console.log("Downloading template...");
  };

  const handleUpload = (supplier: string, branch: string, file: File) => {
    // TODO: Parse Excel and show preview
    console.log("Uploading:", file.name, "for", supplier, branch);
    setUploadedFileName(file.name);
    setPreviewData(mockPreviewData);
    setUploadCount((prev) => prev + 1);
  };

  const totalRows = previewData.length;
  const validRows = previewData.filter((r) => r.status === "valid").length;
  const invalidRows = previewData.filter((r) => r.status === "invalid").length;

  return (
    <SectionLayout>
      <PageHeader
        title="Bulk Vehicle Upload (Excel)"
        description="Upload multiple vehicles using Excel file"
        showAction={false}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatsCard label="Total Uploads" value={uploadCount} icon={<Upload size={20} />} color="blue" />
        <StatsCard label="Valid Rows" value={validRows} icon={<FileCheck size={20} />} color="emerald" />
        <StatsCard label="Invalid Rows" value={invalidRows} icon={<AlertTriangle size={20} />} color="red" />
      </div>

      {/* Download Template */}
      <DownloadTemplate onDownload={handleDownloadTemplate} />

      {/* Upload Form */}
      <BulkUploadForm
        suppliers={suppliersData}
        branches={branchesData}
        onUpload={handleUpload}
      />

      {/* Excel Preview */}
      <ExcelPreviewTable data={previewData} fileName={uploadedFileName} />
    </SectionLayout>
  );
}
