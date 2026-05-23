"use client";

import { useState } from "react";
import { Car, ImageIcon } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsCard from "@/components/ui/StatsCard";
import { vehiclesPhotos, VehiclePhoto } from "@/lib/data";
import VehiclePhotoUploadForm from "@/app/admin/components/vehiclePhoto/VehiclePhotoUploadForm";
import VehiclePhotoGrid from "@/app/admin/components/vehiclePhoto/VehiclePhotoGrid";

export default function VehiclesPhotosPage() {
  const [vehicles, setVehicles] = useState<VehiclePhoto[]>(vehiclesPhotos);

  const totalVehicles = vehicles.length;
  const withPhotos = vehicles.filter((v) => v.image).length;
  const withoutPhotos = vehicles.filter((v) => !v.image).length;

  const handleUpload = (vehicleName: string, files: File[]) => {
    console.log("Uploading", files.length, "files for", vehicleName);
  };

  const handleDelete = (id: number) => {
    setVehicles((prev) => prev.filter((v) => v.id !== id));
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

      <VehiclePhotoUploadForm onSubmit={handleUpload} />

      <VehiclePhotoGrid vehicles={vehicles} onDelete={handleDelete} />
    </SectionLayout>
  );
}
