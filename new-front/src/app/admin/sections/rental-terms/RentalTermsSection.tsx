"use client";

import { useState, useEffect } from "react";
import { Search, Check, X, Trash2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import RichTextEditor from "@/components/shared/RichTextEditor";
import Pagination from "@/components/ui/Pagination";
import { rentalTermsApi } from "@/services/api";
import { toast } from "react-hot-toast";

export default function RentalTermsSection() {
  const [terms, setTerms] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchTerms = async () => {
    setIsLoading(true);
    try {
      const res: any = await rentalTermsApi.getAll();
      const list = res?.data || res || [];
      const sorted = [...list].sort((a: any, b: any) => b.id - a.id);
      setTerms(sorted);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTerms();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      await rentalTermsApi.updateStatus({ id, status: "approved" });
      fetchTerms();
    } catch (e) {
      console.error("Failed to approve", e);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await rentalTermsApi.updateStatus({ id, status: "rejected" });
      fetchTerms();
    } catch (e) {
      console.error("Failed to reject", e);
    }
  };
  
  const handleDelete = (id: number) => {
    toast((t) => (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-medium text-gray-800">Delete this rental term?</p>
        <div className="flex gap-2 justify-end">
          <button
            onClick={async () => {
              toast.dismiss(t.id);
              try {
                await rentalTermsApi.delete(id);
                toast.success("Deleted successfully!");
                fetchTerms();
              } catch (e) {
                console.error("Failed to delete", e);
                toast.error("Failed to delete!");
              }
            }}
            className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    ), { duration: 6000 });
  };

  const handleSubmit = async () => {
    if (!newTitle.trim() || !newDescription.trim()) return;
    try {
      await rentalTermsApi.create({ title: newTitle, description: newDescription });
      setNewTitle("");
      setNewDescription("");
      toast.success("Added successfully!");
      fetchTerms();
    } catch (e) {
      console.error("Failed to create", e);
      toast.error("Failed to add!");
    }
  };

  const filteredTerms = terms.filter((term) => {
    const title = term.title || "";
    return searchQuery === "" || title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const paginatedTerms = filteredTerms.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

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

  /**
   * Rental Terms (Checkout & Car Details Policies):
   * This feature allows admins and suppliers to define specific legal policies, requirements, and rules
   * (e.g., driver requirements, fuel policies, insurance details, security deposits) for car rentals.
   * Approved terms are displayed dynamically on the customer-facing site under the "Rental Terms" or
   * checkout policies section for each vehicle, allowing customers to review terms before finalizing bookings.
   */
  return (
    <SectionLayout>
      <PageHeader title="Rental Terms" description="Manage rental terms and conditions" showAction={false} />

      {/* Add New Term Form */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Title Input */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Title</label>
            <div className="flex-1">
              <RichTextEditor
                value={newTitle}
                onChange={setNewTitle}
                placeholder="Enter term title..."
                minHeight={150}
                className="rounded-xl h-full"
              />
            </div>
          </div>

          {/* Description Input */}
          <div className="flex flex-col">
            <label className="text-sm font-medium text-gray-700 mb-1 block">Description</label>
            <div className="flex-1">
              <RichTextEditor
                value={newDescription}
                onChange={setNewDescription}
                placeholder="Enter term description..."
                minHeight={150}
                className="rounded-xl h-full"
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
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
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
        {isLoading ? (
             <div className="flex items-center justify-center py-20">
               <span className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
             </div>
        ) : (
        <div className="divide-y divide-gray-100">
          {paginatedTerms.map((term) => (
            <div key={term.id} className="grid grid-cols-12 gap-4 px-5 py-4 hover:bg-gray-50/50 transition-colors items-start">
              {/* Title Column */}
              <div className="col-span-3">
                {term.title?.includes("<") ? (
                  <div className="text-sm font-semibold text-gray-900" dangerouslySetInnerHTML={{ __html: term.title }} />
                ) : (
                  <p className="text-sm font-semibold text-gray-900">{term.title}</p>
                )}
                {term.category && (
                  <p className="text-xs text-gray-400 mt-1">{term.category}</p>
                )}
              </div>

              {/* Description Column */}
              <div className="col-span-5">
                {term.description?.includes("<") ? (
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
                  {term.status || "pending"}
                </span>
              </div>

              {/* Action Column */}
              <div className="col-span-2 flex justify-end gap-2 flex-wrap">
                {(!term.status || term.status === "pending") && (
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
                <button
                  onClick={() => handleDelete(term.id)}
                  className="inline-flex items-center gap-1 px-2 py-1.5 rounded-md text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
        )}

        {!isLoading && filteredTerms.length === 0 && (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-gray-500">No terms found</p>
          </div>
        )}

        {!isLoading && filteredTerms.length > 0 && (
          <div className="border-t border-gray-100 p-4">
            <Pagination 
              currentPage={currentPage} 
              totalPages={Math.ceil(filteredTerms.length / itemsPerPage)} 
              onPageChange={setCurrentPage} 
            />
          </div>
        )}
      </div>
    </SectionLayout>
  );
}
