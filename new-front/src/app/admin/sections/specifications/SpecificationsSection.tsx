"use client";

import { useState, useEffect } from "react";
import { Settings2, Pencil, Gauge, Fuel, Users, Briefcase } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsCard from "@/components/ui/StatsCard";
import SpecificationForm from "@/app/admin/components/specifications/SpecificationForm";
import SpecificationsTable, { Specification } from "@/app/admin/components/specifications/SpecificationsTable";
import { specificationApi } from "@/services/api";
import toast from "react-hot-toast";



export default function SpecificationsPage() {

  const [specifications, setSpecifications] = useState<Specification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSpecs = () => {
    setIsLoading(true);
    specificationApi.getAll()
      .then((res: any) => {
        // Backend returns array directly: [{id, name, icon, options}, ...]
        const list = Array.isArray(res) ? res
          : Array.isArray(res?.data) ? res.data
          : [];
        // Backend returns options as a JSON string
        const parsedList = list.map((spec: any) => ({
          ...spec,
          options: typeof spec.options === 'string' ? JSON.parse(spec.options || '[]') : (spec.options || [])
        }));
        setSpecifications(parsedList);
      })
      .catch((err) => console.warn(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadSpecs();
  }, []);

  const totalSpecs = specifications.length;
  const textFields = specifications.filter((s) => s.options && s.options.length === 1).length;
  const selectFields = specifications.filter((s) => s.options && s.options.length > 1).length;

  const [editingSpec, setEditingSpec] = useState<Specification | null>(null);

  const handleSubmit = async (id: number | null, name: string, options: string[], icon: string) => {
    try {
      if (id) {
        await specificationApi.update({ id, name, options: JSON.stringify(options), icon });
        toast.success("Specification updated successfully!");
        setEditingSpec(null);
      } else {
        await specificationApi.create({ name, options: JSON.stringify(options), icon });
        toast.success("Specification added successfully!");
      }
      loadSpecs();
    } catch (e: any) {
      toast.error(id ? "Failed to update specification." : "Failed to add specification.");
      console.error(e);
    }
  };

  const handleEdit = (id: number) => {
    const spec = specifications.find((s) => s.id === id);
    if (spec) setEditingSpec(spec);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingSpec(null);
  };

  const handleDelete = async (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-gray-800">Delete this specification?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await specificationApi.delete(id);
                toast.success("Specification deleted!");
                loadSpecs();
              } catch {
                toast.error("Failed to delete specification.");
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
      <SpecificationForm onSubmit={handleSubmit} initialData={editingSpec} onCancel={handleCancelEdit} />

      {/* Table */}
      <SpecificationsTable
        specifications={specifications}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </SectionLayout>
  );
}
