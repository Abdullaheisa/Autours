"use client";

import { useState, useRef } from "react";
import { Upload, X, ImagePlus, Check } from "lucide-react";

interface VehiclePhotoUploadFormProps {
  onSubmit: (vehicleName: string, files: File[]) => void;
}

export default function VehiclePhotoUploadForm({ onSubmit }: VehiclePhotoUploadFormProps) {
  const [vehicleName, setVehicleName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
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
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(droppedFiles)]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (vehicleName.trim() && files.length > 0) {
      onSubmit(vehicleName, files);
      setVehicleName("");
      setFiles([]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 lg:p-6">
      <div className="flex items-center gap-2 mb-5">
        <ImagePlus size={20} className="text-primary-600" />
        <h3 className="text-base sm:text-lg font-bold text-gray-900">Upload Vehicle Photos</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Vehicle Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Name</label>
          <input
            type="text"
            placeholder="e.g. Toyota Camry 2024"
            value={vehicleName}
            onChange={(e) => setVehicleName(e.target.value)}
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Submit Button */}
        <div className="flex items-end">
          <button
            onClick={handleSubmit}
            disabled={!vehicleName.trim() || files.length === 0}
            className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary-200 flex items-center justify-center gap-2"
          >
            <Check size={16} />
            Submit
          </button>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`mt-4 border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragActive
            ? "border-primary-500 bg-primary-50"
            : "border-gray-200 hover:border-gray-300 bg-gray-50/50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Upload size={32} className={`mx-auto mb-3 transition-colors ${dragActive ? "text-primary-500" : "text-gray-300"}`} />
        <p className="text-sm font-medium text-gray-600">
          Drop photos here or <span className="text-primary-600">click to browse</span>
        </p>
        <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WebP (max 5MB each)</p>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">{files.length} file(s) selected</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                >
                  <X size={12} />
                </button>
                <p className="text-[10px] text-gray-500 mt-1 truncate">{file.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
