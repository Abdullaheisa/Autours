"use client";

import { useState, useEffect } from "react";
import { Car, ImageIcon } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsCard from "@/components/ui/StatsCard";
import { VehiclePhoto } from "@/lib/data";
import { photoApi } from "@/services/api";
import VehiclePhotoUploadForm from "@/app/admin/components/vehiclePhoto/VehiclePhotoUploadForm";
import VehiclePhotoGrid from "@/app/admin/components/vehiclePhoto/VehiclePhotoGrid";
import toast from "react-hot-toast";

export default function VehiclesPhotosPage() {
  const [vehicles, setVehicles] = useState<VehiclePhoto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingVehicle, setEditingVehicle] = useState<VehiclePhoto | null>(null);

  const loadPhotos = async () => {
    try {
      const res: any = await photoApi.getAll();
      const list = Array.isArray(res) ? res
        : Array.isArray(res?.data) ? res.data
        : [];
      setVehicles(list.map((item: any) => ({
        id: item.id,
        name: item.name || "Unknown",
        image: item.photo || item.image || "",
        category: item.category || item.name || "",
      })));
    } catch (err: any) {
      console.warn(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, []);

  const totalVehicles = vehicles.length;
  const withPhotos = vehicles.filter((v) => v.image).length;
  const withoutPhotos = vehicles.filter((v) => !v.image).length;

  const handleUpload = async (vehicleName: string, files: File[]) => {
    try {
      // Backend createPhotos expects: name + photo (one file at a time)
      for (const file of files) {
        const formData = new FormData();
        formData.append("name", vehicleName);
        formData.append("photo", file);
        await photoApi.upload(formData);
      }
      toast.success(`${files.length} photo(s) uploaded successfully!`);
      await loadPhotos();
    } catch (e: any) {
      toast.error("Failed to upload photo. Please try again.");
      console.error(e);
    }
  };

  const handleEdit = (vehicle: VehiclePhoto) => {
    setEditingVehicle(vehicle);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingVehicle(null);
  };

  const handleUpdate = async (id: number, vehicleName: string, file: File | null) => {
    try {
      const formData = new FormData();
      formData.append("id", String(id));
      formData.append("name", vehicleName);
      if (file) {
        formData.append("photo", file);
      }
      await photoApi.upload(formData);
      toast.success("Photo updated successfully!");
      setEditingVehicle(null);
      await loadPhotos();
    } catch (e: any) {
      toast.error("Failed to update photo.");
      console.error(e);
    }
  };

  const handleDelete = async (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-gray-800">Delete this photo?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await photoApi.delete({ id });
                setVehicles((prev) => prev.filter((v) => v.id !== id));
                toast.success("Photo deleted!");
              } catch {
                toast.error("Failed to delete photo.");
              }
            }}
            className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700"
          >Delete</button>
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200">Cancel</button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  return (
    <SectionLayout>
      <PageHeader
        title="Vehicles Photos"
        description="Manage vehicle images and galleries"
        showAction={false}
      />

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <StatsCard label="Total Vehicles" value={totalVehicles} icon={<Car size={20} />} color="blue" />
        <StatsCard label="With Photos" value={withPhotos} icon={<ImageIcon size={20} />} color="emerald" />
        <StatsCard label="Without Photos" value={withoutPhotos} icon={<ImageIcon size={20} />} color="amber" />
      </div>

      <VehiclePhotoUploadForm 
        onSubmit={handleUpload} 
        editingVehicle={editingVehicle}
        onCancelEdit={handleCancelEdit}
        onUpdate={handleUpdate}
      />

      <VehiclePhotoGrid vehicles={vehicles} onDelete={handleDelete} onEdit={handleEdit} />
    </SectionLayout>
  );
}
