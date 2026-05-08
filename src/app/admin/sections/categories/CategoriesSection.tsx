"use client";

import { useState, useEffect } from "react";
import { Grid3X3, Pencil, Car, CheckCircle2, XCircle, Upload, Save } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsCard from "@/components/ui/StatsCard";
import ImageUploader from "@/components/ui/ImageUploader";
import CategoryCard from "./CategoryCard";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { 
  fetchCategories, 
  saveLocalCategory, 
  deleteLocalCategory 
} from "@/store/slices/categoriesSlice";

export default function CategoriesSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: categories, loading, error } = useSelector((state: RootState) => state.categories);

  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<any>({ name: "", active: true, image: null });

  useEffect(() => {
    if (categories.length === 0) dispatch(fetchCategories());
  }, [dispatch, categories.length]);

  const totalCategories = categories.length;
  const activeCategories = categories.filter(c => c.active).length;
  const totalVehicles = categories.reduce((sum, c) => sum + c.vehicles, 0);

  const handleEdit = (category: any) => {
    setCurrentCategory(category);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      dispatch(deleteLocalCategory(id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(saveLocalCategory(currentCategory));
    resetForm();
  };

  const resetForm = () => {
    setCurrentCategory({ name: "", active: true, image: null });
    setIsEditing(false);
  };

  return (
    <SectionLayout>
      <PageHeader title="Categories" description="Manage vehicle categories and classifications" showAction={false} />
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatsCard label="Total Categories" value={totalCategories} icon={<Grid3X3 size={20} />} color="blue" />
        <StatsCard label="Active" value={activeCategories} icon={<CheckCircle2 size={20} />} color="emerald" />
        <StatsCard label="Inactive" value={totalCategories - activeCategories} icon={<XCircle size={20} />} color="red" />
        <StatsCard label="Total Vehicles" value={totalVehicles} icon={<Car size={20} />} color="purple" />
      </div>

      {/* Category Form */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          {isEditing ? <Pencil size={20} className="text-amber-500" /> : <Upload size={20} className="text-primary-600" />}
          {isEditing ? "Edit Category" : "Add New Category"}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="md:col-span-1">
            <ImageUploader 
              label="Category Image"
              value={currentCategory.image}
              onChange={(val) => setCurrentCategory({ ...currentCategory, image: val })}
            />
          </div>
          <div className="md:col-span-1">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Category Name</label>
            <input 
              type="text" 
              value={currentCategory.name}
              onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              placeholder="e.g. Sedan, SUV, etc."
              required
            />
          </div>
          <div className="flex gap-2">
            <button 
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary-100"
            >
              <Save size={18} />
              {isEditing ? "Update" : "Save"}
            </button>
            {isEditing && (
              <button 
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-3 rounded-xl font-bold text-sm transition-all"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <CategoryCard 
            key={category.id}
            category={category}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </SectionLayout>
  );
}
