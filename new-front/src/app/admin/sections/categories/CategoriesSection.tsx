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
  createCategory,
  updateCategory,
  deleteCategory as deleteCategoryThunk
} from "@/store/slices/categoriesSlice";
import toast from "react-hot-toast";
import { BACKEND_URL } from "@/config/api";

export default function CategoriesSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: categories, loading, error } = useSelector((state: RootState) => state.categories);

  const [isEditing, setIsEditing] = useState(false);
  
  const [currentCategory, setCurrentCategory] = useState<{
    id?: number;
    name: string;
    description: string;
    active: boolean;
    existingPhotoUrl: string; 
    photoFile: File | null;   
  }>({ 
    name: "", 
    description: "",
    active: true, 
    existingPhotoUrl: "", 
    photoFile: null 
  });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const totalCategories = categories.length;
  const activeCategories = categories.filter(c => c.active).length;
  const totalVehicles = categories.reduce((sum, c) => sum + (c.vehicles || 0), 0);

  const handleEdit = (category: any) => {
    const rawPhotoPath = category.photo || category.image || category.image_path || "";
    const cleanName = rawPhotoPath.replace(/^img\/categories\//, '').replace(/^categories\//, '').replace(/^\//, '');
    const fullPhotoUrl = rawPhotoPath.startsWith("http") 
        ? rawPhotoPath 
        : (rawPhotoPath ? `${BACKEND_URL}/img/categories/${cleanName}` : "");

    setCurrentCategory({ 
      id: category.id, 
      name: category.name,
      description: category.description || "",
      active: category.active !== undefined ? category.active : true,
      existingPhotoUrl: fullPhotoUrl,
      photoFile: null 
    });
    
    setIsEditing(true); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-gray-800">Delete this category?</p>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              const result = await dispatch(deleteCategoryThunk(id));
              if (deleteCategoryThunk.fulfilled.match(result)) {
                toast.success("Category deleted successfully!");
              } else {
                toast.error("Failed to delete category.");
              }
            }}
            className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700"
          >Delete</button>
          <button onClick={() => toast.dismiss(t.id)} className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200">Cancel</button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (currentCategory.description.length > 1000) {
      toast.error("Description is too long! (Max 1000 characters)");
      return;
    }

    const payloadData = {
      name: currentCategory.name,
      description: currentCategory.description,
      photoFile: currentCategory.photoFile 
    };

    if (isEditing && currentCategory.id) {
      const result = await dispatch(updateCategory({ id: currentCategory.id, data: payloadData }));
      if (updateCategory.fulfilled.match(result)) {
        toast.success("Category updated successfully!");
        resetForm();
      } else {
        toast.error("Failed to update category.");
      }
    } else {
      const result = await dispatch(createCategory(payloadData));
      if (createCategory.fulfilled.match(result)) {
        toast.success("Category created successfully!");
        resetForm();
      } else {
        toast.error("Failed to create category.");
      }
    }
  };

  const resetForm = () => {
    setCurrentCategory({ name: "", description: "", active: true, existingPhotoUrl: "", photoFile: null });
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

      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
          {isEditing ? <Pencil size={20} className="text-amber-500" /> : <Upload size={20} className="text-primary-600" />}
          {isEditing ? "Edit Category" : "Add New Category"}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          <div className="md:col-span-1">
            <ImageUploader 
              key={isEditing ? `edit-${currentCategory.id}` : 'new-category'} 
              label="Category Image"
              value={currentCategory.existingPhotoUrl || null}
              onChange={(val) => {
                if (!val) setCurrentCategory(prev => ({ ...prev, existingPhotoUrl: "", photoFile: null }));
              }}
              onFileChange={(file) => setCurrentCategory(prev => ({ ...prev, photoFile: file }))}
            />
          </div>
          <div className="md:col-span-2 space-y-4">
            <div>
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
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Description</label>
                <span className={`text-xs font-bold ${currentCategory.description.length > 1000 ? 'text-red-500 font-extrabold' : 'text-gray-400'}`}>
                  {currentCategory.description.length} / 1000 chars
                </span>
              </div>
              <textarea 
                value={currentCategory.description}
                onChange={(e) => setCurrentCategory(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all min-h-[120px] resize-y"
                placeholder="Write a description for this category..."
              />
              {currentCategory.description.length > 1000 && (
                <p className="text-xs text-red-500 font-bold mt-1.5">Description cannot exceed 1000 characters.</p>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <button 
                type="submit"
                disabled={currentCategory.description.length > 1000}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-primary-100"
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