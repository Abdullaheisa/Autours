import React, { useState } from 'react';
import { X, Edit2, Trash2, Plus, Check, Loader2 } from 'lucide-react';
import { blogCategoryApi } from '@/services/api';
import toast from 'react-hot-toast';

interface Category {
  id: number;
  title: string;
  activation: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
}

export default function ManageCategoriesModal({ isOpen, onClose, categories, onCategoriesChange }: Props) {
  const [loading, setLoading] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');

  if (!isOpen) return null;

  const fetchCategories = async () => {
    try {
      const res: any = await blogCategoryApi.getAll();
      onCategoriesChange(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    setLoading(true);
    try {
      await blogCategoryApi.create({ title: newTitle.trim(), activation: true });
      toast.success('Category added successfully');
      setNewTitle('');
      await fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editTitle.trim()) return;
    setLoading(true);
    try {
      await blogCategoryApi.update(id, { title: editTitle.trim(), activation: true });
      toast.success('Category updated successfully');
      setEditingId(null);
      await fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    setLoading(true);
    try {
      await blogCategoryApi.delete(id);
      toast.success('Category deleted successfully');
      await fetchCategories();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900">Manage Categories</h2>
          <button onClick={onClose} className="p-2 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="New Category Title"
              className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button
              onClick={handleAdd}
              disabled={loading || !newTitle.trim()}
              className="px-4 py-2 bg-primary text-gray-900 font-bold rounded-xl disabled:opacity-50 flex items-center gap-2"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              Add
            </button>
          </div>

          <div className="space-y-2 mt-4">
            {categories.length === 0 ? (
              <p className="text-center text-sm text-gray-500 py-4">No categories found.</p>
            ) : (
              categories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl bg-gray-50 group">
                  {editingId === cat.id ? (
                    <div className="flex flex-1 gap-2 mr-2">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm"
                        autoFocus
                      />
                      <button onClick={() => handleUpdate(cat.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg">
                        <Check size={16} />
                      </button>
                      <button onClick={() => setEditingId(null)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg">
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-sm font-bold text-gray-700">{cat.title}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditingId(cat.id); setEditTitle(cat.title); }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
