"use client";

import { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import Pagination from "@/components/ui/Pagination";
import { subscriberApi } from "@/services/api";
import toast from "react-hot-toast";

type Subscriber = {
  id: number;
  email: string;
  country: string;
  type?: string;
};

export default function SubscribersSection() {
  const [items, setItems] = useState<Subscriber[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchSubscribers = async () => {
    setIsLoading(true);
    try {
      const res: any = await subscriberApi.getAll();
      const list = res?.data || res || [];
      setItems(list.map((r: any) => {
        return {
          id: r.id,
          email: r.email,
          country: r.country || null,
          type: r.type || "offers",
        };
      }));
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleExportCSV = () => {
    if (filteredItems.length === 0) {
      toast.error("No subscribers to export!");
      return;
    }
    
    const headers = ["ID", "Email", "Country", "Type"];
    const rows = filteredItems.map((item) => [
      item.id,
      item.email,
      item.country,
      item.type || "offers",
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `subscribers-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success("Subscribers list exported successfully!");
  };

  const handleDelete = (id: number) => {
    toast(
      (t) => (
        <span className="flex flex-col gap-2">
          <span className="font-bold text-gray-800">Delete this subscriber?</span>
          <span className="text-sm text-gray-500">This action cannot be undone.</span>
          <div className="flex gap-2 mt-1">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await subscriberApi.delete(id);
                  toast.success("Subscriber deleted!");
                  fetchSubscribers();
                } catch (e) {
                  console.error(e);
                  toast.error("Failed to delete subscriber!");
                }
              }}
              className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </span>
      ),
      { duration: 10000, icon: '⚠️' }
    );
  };

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const email = item.email || "";
      const matchesSearch = searchQuery === "" || email.toLowerCase().includes(searchQuery.toLowerCase());
      
      const itemType = item.type || "offers";
      const matchesType = selectedType === "all" ||
        (selectedType === "offers" && itemType === "offers") ||
        (selectedType === "supplier" && itemType === "supplier");

      return matchesSearch && matchesType;
    });
  }, [items, searchQuery, selectedType]);

  const paginatedItems = useMemo(() => {
    return filteredItems.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [filteredItems, currentPage]);

  return (
    <SectionLayout>
      <PageHeader title="Subscribers" description="Manage newsletter subscriptions and supplier email requests" showAction={false} />

      {/* Export & Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-100/50"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export CSV
        </button>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Dropdown Filter */}
          <select
            value={selectedType}
            onChange={(e) => { setSelectedType(e.target.value); setCurrentPage(1); }}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary transition-all cursor-pointer"
          >
            <option value="all">All Types</option>
            <option value="offers">Newsletters</option>
            <option value="supplier">Supplier Requests</option>
          </select>
          
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search subscribers..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/30">
          <div className="col-span-5 text-sm font-medium text-gray-500">Email</div>
          <div className="col-span-3 text-sm font-medium text-gray-500">Country</div>
          <div className="col-span-2 text-sm font-medium text-gray-500">Type</div>
          <div className="col-span-2 text-sm font-medium text-gray-500 text-right">Action</div>
        </div>

        {/* Table Body */}
        {isLoading ? (
             <div className="flex items-center justify-center py-20">
               <span className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
             </div>
        ) : (
        <div className="divide-y divide-gray-100">
          {paginatedItems.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-4 px-5 py-3 hover:bg-gray-50/50 transition-colors items-center"
            >
              {/* Email/Name Column */}
              <div className="col-span-5">
                <p className="text-sm text-gray-900">{item.email}</p>
              </div>

              {/* Country Column */}
              <div className="col-span-3">
                <p className="text-sm text-gray-600">{item.country || "-"}</p>
              </div>

              {/* Type Column */}
              <div className="col-span-2">
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                  item.type === 'supplier' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                }`}>
                  {item.type === 'supplier' ? 'Supplier Request' : 'Newsletter'}
                </span>
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
        )}

        {!isLoading && filteredItems.length === 0 && (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-gray-500">No subscribers found</p>
          </div>
        )}

        {!isLoading && filteredItems.length > 0 && (
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
