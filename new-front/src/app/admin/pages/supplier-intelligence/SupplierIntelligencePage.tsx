"use client";

import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { loadSupplierAnalytics, setFilters, updateNegotiation } from "@/store/slices/supplierAnalyticsSlice";
import { FilterBar } from "./components/FilterBar";
import { AnalyticsCards } from "./components/AnalyticsCards";
import { SupplierTable } from "./components/SupplierTable";
import { MarketCharts } from "./components/MarketCharts";
import { NegotiationModal } from "./components/NegotiationModal";
import { Search, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

export default function SupplierIntelligencePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, data, stats, filters, error } = useSelector((state: RootState) => state.supplierAnalytics);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleFilterChange = (key: string, value: string) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleSearch = () => {
    setHasSearched(true);
    dispatch(loadSupplierAnalytics(filters));
  };

  /**
   * Export currently displayed (filtered) results to a real .xlsx file using SheetJS.
   * Includes all required columns: Supplier, Car, Country, Category, Car Type,
   * Daily/Weekly/Monthly Price, Availability, Negotiation Status.
   */
  const handleExportToExcel = () => {
    if (!data || data.length === 0) return;

    const exportData = data.map((item: any) => ({
      "Supplier Name":       item.name,
      "Car Name":            item.carName,
      "Country":             filters.country !== "All" ? filters.country : (item.branchLocations?.[0] || "—"),
      "Category":            item.category,
      "Car Type":            item.fuel || "—",
      "Daily Price (AED)":   item.dailyPrice,
      "Weekly Price (AED)":  item.weeklyPrice,
      "Monthly Price (AED)": item.monthlyPrice,
      "Availability":        item.availability,
      "Negotiation Status":  item.negotiationStatus || "none",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Auto-size columns for readability
    const colWidths = Object.keys(exportData[0] || {}).map(key => ({
      wch: Math.max(key.length + 2, 18)
    }));
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Supplier Intelligence");

    const dateStr = new Date().toISOString().split("T")[0];
    XLSX.writeFile(workbook, `Supplier-Intelligence-Report-${dateStr}.xlsx`);
  };

  const handleNegotiate = (supplier: any) => {
    setSelectedSupplier(supplier);
    setIsModalOpen(true);
  };

  const handleSaveNegotiation = (payload: any) => {
    if (selectedSupplier) {
      dispatch(updateNegotiation({ id: selectedSupplier.id, payload }));
    }
    setIsModalOpen(false);
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  const renderLoadingSkeleton = () => (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100/80 rounded-2xl h-32 border border-gray-200/50" />
        ))}
      </div>
      <div className="bg-gray-100/80 rounded-2xl h-[340px] border border-gray-200/50" />
      <div className="bg-white rounded-2xl border border-gray-200/50 overflow-hidden">
        <div className="h-16 bg-gray-50 border-b border-gray-100 flex items-center px-6">
          <div className="h-4 bg-gray-200 rounded w-48" />
        </div>
        <div className="p-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32" />
                  <div className="h-3 bg-gray-100 rounded w-20" />
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-16" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Empty states ──────────────────────────────────────────────────────────
  const renderEmptyState = () => (
    <div className="bg-white rounded-[2rem] border border-gray-100 p-8 md:p-16 text-center max-w-3xl mx-auto shadow-sm my-8">
      <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 text-primary">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75l-2.489-2.489m0 0a3.375 3.375 0 10-4.773-4.773 3.375 3.375 0 004.774 4.774zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-xl md:text-2xl font-black text-gray-900 uppercase italic font-title tracking-tight mb-3">
        Start Your Supplier Pricing Analysis
      </h3>
      <p className="text-gray-500 text-sm md:text-base leading-relaxed max-w-lg mx-auto mb-8 font-medium">
        Select your filters above and click <strong>Search</strong> to load supplier pricing data.
      </p>
      <button
        onClick={handleSearch}
        className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-black uppercase tracking-wider"
      >
        <Search className="w-4 h-4" />
        Analyze Market Data
      </button>
    </div>
  );

  const renderEmptyResults = () => (
    <div className="bg-white rounded-[2rem] border border-gray-100 p-12 text-center max-w-xl mx-auto shadow-sm my-8">
      <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4 text-amber-500">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">No Matching Supplier Data Found</h3>
      <p className="text-gray-500 text-sm">
        No results matched your filters. Try adjusting your parameters and searching again.
      </p>
    </div>
  );

  const hasData = data && data.length > 0;

  return (
    <div className="space-y-6">

      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Supplier Pricing Intelligence</h2>
        <p className="text-sm text-gray-500 mt-1">Analyze market rates, compare suppliers, and manage negotiations.</p>
      </div>

      {/* Filter bar — no export button here */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        loading={loading}
      />

      {/* Content */}
      {loading ? (
        renderLoadingSkeleton()
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium">{error}</div>
      ) : !hasSearched ? (
        renderEmptyState()
      ) : !hasData ? (
        renderEmptyResults()
      ) : (
        <>
          <AnalyticsCards stats={stats} />

          <div className="grid grid-cols-1 gap-6">
            <MarketCharts data={data} />
          </div>

          {/* Table card — export button lives in the header here */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Supplier Comparison</h3>
                <p className="text-xs text-gray-400 mt-0.5">{data.length} result{data.length !== 1 ? "s" : ""} based on current filters</p>
              </div>

              {/* ── Export button — compact icon + label ── */}
              <button
                type="button"
                onClick={handleExportToExcel}
                disabled={!hasData}
                title="Export to Excel (.xlsx)"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 active:scale-95 transition-all text-xs font-bold disabled:opacity-40 disabled:pointer-events-none shadow-sm"
              >
                <FileSpreadsheet size={15} />
                Export
              </button>
            </div>

            <SupplierTable data={data} onNegotiate={handleNegotiate} />
          </div>
        </>
      )}

      <NegotiationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        supplier={selectedSupplier}
        onSave={handleSaveNegotiation}
      />
    </div>
  );
}
