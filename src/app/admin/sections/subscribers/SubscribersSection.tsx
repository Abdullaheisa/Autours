"use client";

import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import { subscribers, Subscriber } from "@/lib/data";

export default function SubscribersSection() {
  const [items, setItems] = useState<Subscriber[]>(subscribers);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredItems = items.filter((item) =>
    searchQuery === "" || item.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SectionLayout>
      <PageHeader title="Subscribers" description="Manage newsletter subscribers" showAction={false} />

      {/* Subscribers Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/30">
          <div className="col-span-6 text-sm font-medium text-gray-500">Name</div>
          <div className="col-span-4 text-sm font-medium text-gray-500">Country</div>
          <div className="col-span-2 text-sm font-medium text-gray-500 text-right">
            <input
              type="text"
              placeholder="Type to search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-gray-100">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="grid grid-cols-12 gap-4 px-5 py-3 hover:bg-gray-50/50 transition-colors items-center"
            >
              {/* Email/Name Column */}
              <div className="col-span-6">
                <p className="text-sm text-gray-900">{item.email}</p>
              </div>

              {/* Country Column */}
              <div className="col-span-4">
                <p className="text-sm text-gray-600">{item.country || "-"}</p>
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
            <p className="text-sm text-gray-500">No subscribers found</p>
          </div>
        )}
      </div>
    </SectionLayout>
  );
}
