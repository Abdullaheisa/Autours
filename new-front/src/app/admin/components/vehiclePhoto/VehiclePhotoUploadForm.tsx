"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, ImagePlus, Check } from "lucide-react";
import { VehiclePhoto } from "@/lib/data";
import { getVehicleImageUrl } from "@/utils/getImageUrl";

interface VehiclePhotoUploadFormProps {
  onSubmit: (vehicleName: string, files: File[]) => void;
  editingVehicle?: VehiclePhoto | null;
  onCancelEdit?: () => void;
  onUpdate?: (id: number, vehicleName: string, file: File | null) => void;
}

export default function VehiclePhotoUploadForm({
  onSubmit,
  editingVehicle,
  onCancelEdit,
  onUpdate,
}: VehiclePhotoUploadFormProps) {
  const [vehicleName, setVehicleName] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync state when editingVehicle changes
  useEffect(() => {
    if (editingVehicle) {
      setVehicleName(editingVehicle.name);
      setFiles([]); // Clear newly uploaded files for edit mode
    } else {
      setVehicleName("");
      setFiles([]);
    }
  }, [editingVehicle]);

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
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      setFiles((prev) => [...prev, ...Array.from(selectedFiles)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (editingVehicle && onUpdate) {
      if (vehicleName.trim()) {
        onUpdate(editingVehicle.id, vehicleName.trim(), files[0] || null);
      }
    } else {
      if (vehicleName.trim() && files.length > 0) {
        onSubmit(vehicleName.trim(), files);
      }
    }
  };

  const isFormValid = editingVehicle 
    ? vehicleName.trim() !== "" 
    : (vehicleName.trim() !== "" && files.length > 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 lg:p-6">
      <div className="flex items-center gap-2 mb-5">
        <ImagePlus size={20} className="text-primary-600" />
        <h3 className="text-base sm:text-lg font-bold text-gray-900">
          {editingVehicle ? "Edit Vehicle Photo" : "Upload Vehicle Photos"}
        </h3>
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

        {/* Action Buttons */}
        <div className="flex items-end gap-3">
          <button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="flex-1 sm:flex-none bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed text-white px-8 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-primary-200 flex items-center justify-center gap-2"
          >
            <Check size={16} />
            {editingVehicle ? "Update" : "Submit"}
          </button>
          
          {editingVehicle && onCancelEdit && (
            <button
              onClick={onCancelEdit}
              className="flex-1 sm:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl font-medium transition-all flex items-center justify-center gap-2"
            >
              <X size={16} />
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Edit Mode Existing Image Preview */}
      {editingVehicle && !files.length && (
        <div className="mt-4">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Current Photo</p>
          <div className="w-28 h-20 rounded-lg overflow-hidden border border-gray-200">
            <img 
              src={getVehicleImageUrl(editingVehicle.image)} 
              alt={editingVehicle.name} 
              className="w-full h-full object-cover" 
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Upload a new file below only if you want to replace it.</p>
        </div>
      )}

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
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          multiple={!editingVehicle}
        />
        <Upload size={32} className={`mx-auto mb-3 transition-colors ${dragActive ? "text-primary-500" : "text-gray-300"}`} />
        <p className="text-sm font-medium text-gray-600">
          {editingVehicle 
            ? "Drop a new photo here or click to replace current" 
            : "Drop photos here or click to browse"}
        </p>
        <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, WebP (max 5MB)</p>
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
