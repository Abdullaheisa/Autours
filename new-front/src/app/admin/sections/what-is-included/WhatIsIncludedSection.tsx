"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Trash2, AlertCircle } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import Pagination from "@/components/ui/Pagination";
import { includedApi } from "@/services/api";
import { toast } from "react-hot-toast";

export default function WhatIsIncludedSection() {
  const [items, setItems] = useState<any[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Delete State
  const [deletingItem, setDeletingItem] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const loadItems = () => {
    setIsLoading(true);
    includedApi.getAll()
      .then((res: any) => {
        setItems(Array.isArray(res) ? res : res?.data || []);
      })
      .catch((err) => console.warn(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSubmit = async () => {
    if (!newItemName.trim()) {
      toast.error("Please enter a feature name");
      return;
    }
    try {
      await includedApi.create({ 
        included: newItemName.trim()
      });
      setNewItemName("");
      toast.success("Added successfully!");
      loadItems();
    } catch (e) {
      console.error(e);
      toast.error("Failed to add included feature");
    }
  };

  const handleDeleteClick = (item: any) => {
    setDeletingItem(item);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      await includedApi.delete(deletingItem.id);
      setShowDeleteModal(false);
      setDeletingItem(null);
      toast.success("Deleted successfully!");
      loadItems();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete item");
    }
  };

  const filteredItems = items.filter((item) => {
    const itemName = item.what_is_included || item.name || item.title || "";
    return searchQuery === "" || 
      itemName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <SectionLayout>
      <PageHeader title="What is Included?" description="Manage global standard vehicle inclusions and features" showAction={false} />

      {/* Add New Item Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 mb-6">
        <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-primary" /> Add New Included Feature
        </h3>
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              placeholder="e.g. Free Cancellation"
            />
          </div>
          <button
            onClick={handleSubmit}
            className="bg-primary hover:bg-primary-600 text-gray-900 font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Save Feature
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-base font-semibold text-gray-900">All Included Features</h3>
        <div className="relative w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search inclusions..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-10">
        {isLoading ? (
          <div className="px-6 py-12 text-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-sm text-gray-500 font-medium">Loading inclusions...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="px-6 py-16 text-center bg-gray-50/10">
            <p className="text-sm text-gray-500 font-semibold">No included features found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-150">
                <th className="text-left text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5">Feature Name</th>
                <th className="text-right text-xs font-bold text-gray-400 uppercase tracking-wider px-6 py-5 w-[120px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/30 transition-all group">
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-gray-900 leading-snug">{item.what_is_included || item.name}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDeleteClick(item)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent"
                      title="Delete Feature"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {filteredItems.length > 0 && (
          <div className="border-t border-gray-100 p-4">
            <Pagination 
              currentPage={currentPage} 
              totalPages={Math.ceil(filteredItems.length / itemsPerPage)} 
              onPageChange={setCurrentPage} 
            />
          </div>
        )}
      </div>

      {/* Premium Confirm Delete Tailwind Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl border border-gray-100 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-3">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Confirm Delete</h3>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete <span className="font-semibold text-gray-800">"{deletingItem?.what_is_included || deletingItem?.name || deletingItem?.title}"</span>? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center gap-3 px-6 py-4.5 border-t border-gray-150 bg-gray-50/30">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-5 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold text-sm rounded-xl transition-all shadow-sm"
              >
                Delete Feature
              </button>
            </div>
          </div>
        </div>
      )}
    </SectionLayout>
  );
}
