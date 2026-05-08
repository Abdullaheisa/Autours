"use client";

import { useState } from "react";
import { Settings2, Pencil, Gauge, Fuel, Users, Briefcase } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsCard from "@/components/ui/StatsCard";
import SpecificationForm from "@/app/admin/components/specifications/SpecificationForm";
import SpecificationsTable, { Specification } from "@/app/admin/components/specifications/SpecificationsTable";
import { specsData } from "@/lib/data";



export default function SpecificationsPage() {

  const [specifications, setSpecifications] = useState<Specification[]>(specsData);

  const totalSpecs = specifications.length;
  const textFields = specifications.filter((s) => s.options.length === 1).length;
  const selectFields = specifications.filter((s) => s.options.length > 1).length;

  const handleSubmit = (name: string, options: string[], icon: string) => {
    const newSpec: Specification = {
      id: specifications.length + 1,
      name,
      key: name.toLowerCase().replace(/\s+/g, '_'),
      options,
      icon,
    };
    setSpecifications((prev) => [...prev, newSpec]);
  };

  const handleEdit = (id: number) => {
    console.log("Edit spec", id);
  };

  const handleDelete = (id: number) => {
    setSpecifications((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <SectionLayout>
      <PageHeader
        title="Specifications"
        description="Manage vehicle technical specifications"
        showAction={false}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard label="Total Specs" value={totalSpecs} icon={<Settings2 size={20} />} color="blue" />
        <StatsCard label="Text Fields" value={textFields} icon={<Pencil size={20} />} color="purple" />
        <StatsCard label="Select Fields" value={selectFields} icon={<Settings2 size={20} />} color="amber" />
        <StatsCard label="Categories" value={new Set(specifications.map((s) => s.icon)).size} icon={<Gauge size={20} />} color="emerald" />
      </div>

      {/* Form */}
      <SpecificationForm onSubmit={handleSubmit} />

      {/* Table */}
      <SpecificationsTable
        specifications={specifications}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </SectionLayout>
  );
}
