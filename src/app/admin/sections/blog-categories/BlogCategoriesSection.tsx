"use client";

import { useState, useEffect } from "react";
import { Grid3X3, Pencil, FileText, CheckCircle2, XCircle, Upload, Save, ListTree, ToggleLeft, ToggleRight, Trash2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsCard from "@/components/ui/StatsCard";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { 
  fetchBlogCategories, 
  createBlogCategory,
  updateBlogCategory,
  deleteBlogCategory,
  toggleBlogCategoryActivation
} from "@/store/slices/blogCategoriesSlice";
import toast from "react-hot-toast";

function BlogCategoryCard({ category, onEdit, onDelete, onToggle }: any) {
  return (
    <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col h-full relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="p-3 bg-primary/10 text-primary-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
          <ListTree size={24} />
        </div>
        <div className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 backdrop-blur-sm ${
          category.is_active 
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' 
            : 'bg-gray-50 text-gray-500 border border-gray-200/50'
        }`}>
          {category.is_active ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
          {category.is_active ? 'Active' : 'Inactive'}
        </div>
      </div>
      
      <div className="flex-1 relative z-10">
        <h4 className="text-xl font-black text-gray-900 mb-2 group-hover:text-primary transition-colors">{category.name}</h4>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 inline-flex px-3 py-1.5 rounded-lg border border-gray-100">
          <FileText size={16} className="text-gray-400" />
          <span className="font-semibold">{category.blogs_count || 0}</span>
          <span className="text-gray-400">Articles</span>
        </div>
      </div>

      <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between gap-3 relative z-10">
        <button 
          onClick={() => onToggle(category.id)}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border ${
            category.is_active 
              ? 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300' 
              : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100 hover:border-emerald-200'
          }`}
        >
          {category.is_active ? <ToggleRight size={18} className="text-emerald-500" /> : <ToggleLeft size={18} className="text-gray-400" />}
          {category.is_active ? 'Deactivate' : 'Activate'}
        </button>

        <button 
          onClick={() => onEdit(category)}
          className="p-2.5 bg-gray-50 hover:bg-amber-50 text-gray-400 hover:text-amber-500 border border-gray-100 hover:border-amber-200 rounded-xl transition-all shadow-sm"
          title="Edit Category"
        >
          <Pencil size={18} />
        </button>
        <button 
          onClick={() => onDelete(category.id)}
          className="p-2.5 bg-gray-50 hover:bg-red-50 text-gray-400 hover:text-red-500 border border-gray-100 hover:border-red-200 rounded-xl transition-all shadow-sm"
          title="Delete Category"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export default function BlogCategoriesSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: categories, loading, error } = useSelector((state: RootState) => state.blogCategories);

  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<{ id?: number; name: string; is_active: boolean; }>({ 
    name: "", 
    is_active: true
  });

  useEffect(() => {
    dispatch(fetchBlogCategories());
  }, [dispatch]);

  const totalCategories = categories.length;
  const activeCategories = categories.filter(c => c.is_active).length;
  const totalArticles = categories.reduce((sum, c) => sum + (c.blogs_count || 0), 0);

  const handleEdit = (category: any) => {
    setCurrentCategory({ 
      id: category.id, 
      name: category.name,
      is_active: category.is_active !== undefined ? category.is_active : true
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
              const result = await dispatch(deleteBlogCategory(id));
              if (deleteBlogCategory.fulfilled.match(result)) {
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

  const handleToggle = async (id: number) => {
    const result = await dispatch(toggleBlogCategoryActivation(id));
    if (toggleBlogCategoryActivation.fulfilled.match(result)) {
      toast.success("Status updated!");
    } else {
      toast.error("Failed to update status");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const payloadData = {
      title: currentCategory.name,
      activation: currentCategory.is_active
    };

    if (isEditing && currentCategory.id) {
      const result = await dispatch(updateBlogCategory({ id: currentCategory.id, data: payloadData }));
      if (updateBlogCategory.fulfilled.match(result)) {
        toast.success("Category updated successfully!");
        resetForm();
      } else {
        toast.error("Failed to update category.");
      }
    } else {
      const result = await dispatch(createBlogCategory(payloadData));
      if (createBlogCategory.fulfilled.match(result)) {
        toast.success("Category created successfully!");
        resetForm();
      } else {
        toast.error("Failed to create category.");
      }
    }
  };

  const resetForm = () => {
    setCurrentCategory({ name: "", is_active: true });
    setIsEditing(false);
  };

  return (
    <SectionLayout>
      <PageHeader title="Blog Categories" description="Manage categories for your blog articles" showAction={false} />
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatsCard label="Total Categories" value={totalCategories} icon={<ListTree size={20} />} color="blue" />
        <StatsCard label="Active" value={activeCategories} icon={<CheckCircle2 size={20} />} color="emerald" />
        <StatsCard label="Inactive" value={totalCategories - activeCategories} icon={<XCircle size={20} />} color="red" />
        <StatsCard label="Total Articles" value={totalArticles} icon={<FileText size={20} />} color="purple" />
      </div>

      {/* Category Form */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 mb-8 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
        <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2 relative z-10">
          {isEditing ? <Pencil size={20} className="text-amber-500" /> : <Upload size={20} className="text-primary" />}
          {isEditing ? "Edit Category" : "Add New Category"}
        </h3>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end relative z-10">
          <div className="md:col-span-8">
            <label className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2 block">Category Title</label>
            <input 
              type="text" 
              value={currentCategory.name}
              onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
              className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all"
              placeholder="e.g. Travel Tips, Local Guides, Car Care..."
              required
            />
          </div>
          <div className="md:col-span-4 flex gap-3">
            <button 
              type="submit"
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-6 py-3.5 rounded-2xl font-black text-sm transition-all shadow-xl hover:scale-[1.02] active:scale-95 border border-transparent hover:border-gray-700"
            >
              <Save size={18} className="text-primary" />
              {isEditing ? "Update Category" : "Save Category"}
            </button>
            {isEditing && (
              <button 
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center bg-white hover:bg-gray-50 text-gray-600 px-6 py-3.5 rounded-2xl font-bold text-sm transition-all border border-gray-200 hover:border-gray-300"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => (
          <BlogCategoryCard 
            key={category.id}
            category={category}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />
        ))}
        {categories.length === 0 && !loading && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center bg-white rounded-3xl border border-gray-100 text-center">
             <ListTree size={48} className="text-gray-200 mb-4" />
             <h3 className="text-lg font-black text-gray-900">No Blog Categories Yet</h3>
             <p className="text-sm text-gray-500 mt-2 max-w-sm">Create your first blog category using the form above to start organizing your articles.</p>
          </div>
        )}
      </div>
    </SectionLayout>
  );
}
