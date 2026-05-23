"use client";

import { useState } from "react";
import { Search, Check, X } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import { rentalTerms, RentalTerm } from "@/lib/data";

export default function RentalTermsSection() {
  const [terms, setTerms] = useState<RentalTerm[]>(rentalTerms);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const handleApprove = (id: number) => {
    setTerms((prev) => prev.map((t) => (t.id === id ? { ...t, status: "approved" as const } : t)));
  };

  const handleReject = (id: number) => {
    setTerms((prev) => prev.map((t) => (t.id === id ? { ...t, status: "rejected" as const } : t)));
  };

  const handleSubmit = () => {
    if (!newTitle.trim() || !newDescription.trim()) return;
    const newTerm: RentalTerm = {
      id: Date.now(),
      title: newTitle,
      description: newDescription,
      status: "pending",
    };
    setTerms((prev) => [...prev, newTerm]);
    setNewTitle("");
    setNewDescription("");
  };

  const filteredTerms = terms.filter((term) =>
    searchQuery === "" || term.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-emerald-600";
      case "rejected":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <SectionLayout>
      <PageHeader title="Rental Terms" description="Manage rental terms and conditions" showAction={false} />

      {/* Add New Term Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title Input */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Title</label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100 bg-gray-50/50">
                <select className="text-xs bg-transparent border-none focus:ring-0 text-gray-600 cursor-pointer">
                  <option>Heading</option>
                  <option>Paragraph</option>
                </select>
                <select className="text-xs bg-transparent border-none focus:ring-0 text-gray-600 cursor-pointer">
                  <option>Sans Serif</option>
                  <option>Serif</option>
                </select>
                <div className="w-px h-4 bg-gray-300 mx-1" />
                <button className="p-1 hover:bg-gray-200 rounded text-gray-600 font-bold text-xs">B</button>
                <button className="p-1 hover:bg-gray-200 rounded text-gray-600 italic text-xs">I</button>
                <button className="p-1 hover:bg-gray-200 rounded text-gray-600 underline text-xs">U</button>
                <button className="p-1 hover:bg-gray-200 rounded text-gray-600 text-xs">A</button>
                <div className="w-px h-4 bg-gray-300 mx-1" />
                <button className="p-1 hover:bg-gray-200 rounded text-gray-600 text-xs">≡</button>
                <button className="p-1 hover:bg-gray-200 rounded text-gray-600 text-xs">☰</button>
                <button className="p-1 hover:bg-gray-200 rounded text-gray-600 text-xs">☷</button>
              </div>
              <textarea
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full p-3 text-sm text-gray-900 resize-none focus:outline-none min-h-[80px]"
                placeholder="Enter term title..."
              />
            </div>
          </div>

          {/* Description Input */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Toolbar */}
              <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100 bg-gray-50/50">
                <select className="text-xs bg-transparent border-none focus:ring-0 text-gray-600 cursor-pointer">
                  <option>Heading</option>
                  <option>Paragraph</option>
                </select>
                <select className="text-xs bg-transparent border-none focus:ring-0 text-gray-600 cursor-pointer">
                  <option>Sans Serif</option>
                  <option>Serif</option>
                </select>
                <div className="w-px h-4 bg-gray-300 mx-1" />
                <button className="p-1 hover:bg-gray-200 rounded text-gray-600 font-bold text-xs">B</button>
                <button className="p-1 hover:bg-gray-200 rounded text-gray-600 italic text-xs">I</button>
                <button className="p-1 hover:bg-gray-200 rounded text-gray-600 underline text-xs">U</button>
                <button className="p-1 hover:bg-gray-200 rounded text-gray-600 text-xs">A</button>
                <div className="w-px h-4 bg-gray-300 mx-1" />
                <button className="p-1 hover:bg-gray-200 rounded text-gray-600 text-xs">≡</button>
                <button className="p-1 hover:bg-gray-200 rounded text-gray-600 text-xs">☰</button>
                <button className="p-1 hover:bg-gray-200 rounded text-gray-600 text-xs">☷</button>
              </div>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full p-3 text-sm text-gray-900 resize-none focus:outline-none min-h-[80px]"
                placeholder="Enter term description..."
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-3">
          <button
            onClick={handleSubmit}
            className="bg-primary hover:bg-primary-600 text-gray-900 font-medium text-sm px-5 py-2 rounded-lg transition-colors"
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Terms Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/30">
          <div className="col-span-3 text-sm font-medium text-gray-500">Title</div>
          <div className="col-span-5 text-sm font-medium text-gray-500">Description</div>
          <div className="col-span-2 text-sm font-medium text-gray-500">Status</div>
          <div className="col-span-2 text-sm font-medium text-gray-500 text-right">Action</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {filteredTerms.map((term) => (
            <div key={term.id} className="grid grid-cols-12 gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors items-start">
              {/* Title Column */}
              <div className="col-span-3">
                <p className="text-sm font-semibold text-gray-900">{term.title}</p>
                {term.category && (
                  <p className="text-xs text-gray-400 mt-1">{term.category}</p>
                )}
              </div>

              {/* Description Column */}
              <div className="col-span-5">
                {term.description.includes("<") ? (
                  <div 
                    className="text-sm text-gray-600"
                    dangerouslySetInnerHTML={{ __html: term.description }}
                  />
                ) : (
                  <p className="text-sm text-gray-600">{term.description}</p>
                )}
              </div>

              {/* Status Column */}
              <div className="col-span-2">
                <span className={`text-sm capitalize ${getStatusColor(term.status)}`}>
                  {term.status}
                </span>
              </div>

              {/* Action Column */}
              <div className="col-span-2 flex justify-end gap-2">
                {term.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(term.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors"
                    >
                      <Check size={12} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(term.id)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
                    >
                      <X size={12} />
                      Reject
                    </button>
                  </>
                )}
                {term.status === "approved" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <Check size={12} />
                    Approved
                  </span>
                )}
                {term.status === "rejected" && (
                  <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                    <X size={12} />
                    Rejected
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredTerms.length === 0 && (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-gray-500">No terms found</p>
          </div>
        )}
      </div>
    </SectionLayout>
  );
}
