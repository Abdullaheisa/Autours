"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";
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
    if (!newItemName.trim()) return;
    try {
      await includedApi.create({ included: newItemName.trim() });
      setNewItemName("");
      toast.success("Added successfully!");
      loadItems();
    } catch (e) {
      console.error(e);
      toast.error("Failed to add included item");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await includedApi.delete(id);
      toast.success("Deleted successfully!");
      loadItems();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete item");
    }
  };

  const filteredItems = items.filter((item) => {
    const itemName = item.what_is_included || item.name || item.title || "";
    return searchQuery === "" || itemName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const paginatedItems = filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <SectionLayout>
      <PageHeader title="What is Included ?" description="Manage included services and features" showAction={false} />

      {/* Add New Item Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">What is included?</label>
        <div className="max-w-md">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter feature name..."
          />
        </div>
        <div className="flex justify-end mt-3">
          <button
            onClick={handleSubmit}
            className="bg-primary hover:bg-primary-600 text-gray-900 font-medium text-sm px-6 py-2 rounded-lg transition-colors"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex justify-end mb-4">
        <div className="relative w-64">
          <input
            type="text"
            placeholder="Type to search"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/30">
          <div className="col-span-10 text-sm font-medium text-gray-500">What is included?</div>
          <div className="col-span-2 text-sm font-medium text-gray-500 text-right">Action</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {paginatedItems.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-4 px-5 py-3 hover:bg-gray-50/50 transition-colors items-center"
            >
              {/* Name Column */}
              <div className="col-span-10">
                <p className="text-sm text-gray-900">{item.what_is_included || item.name || item.title || "Unknown"}</p>
              </div>

              {/* Action Column */}
              <div className="col-span-2 flex justify-end">
                <button
                  onClick={() => handleDelete(item.id)}
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-red-400 text-white hover:bg-red-500 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-gray-500">No items found</p>
          </div>
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
    </SectionLayout>
  );
}
