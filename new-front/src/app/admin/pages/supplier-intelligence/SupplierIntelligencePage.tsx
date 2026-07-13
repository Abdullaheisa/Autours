"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { loadSupplierAnalytics, setFilters, updateNegotiation } from "@/store/slices/supplierAnalyticsSlice";
import { FilterBar } from "./components/FilterBar";
import { referenceApi, profitApi } from "@/services/api";
import { AnalyticsCards } from "./components/AnalyticsCards";
import { SupplierTable } from "./components/SupplierTable";
import { MarketCharts } from "./components/MarketCharts";
import { NegotiationModal } from "./components/NegotiationModal";
import { Search, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";

export default function SupplierIntelligencePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, data, stats, filters, error, pagination } = useSelector((state: RootState) => state.supplierAnalytics);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [countriesList, setCountriesList] = useState<any[]>([]);
  const [suppliersList, setSuppliersList] = useState<any[]>([]);

  // Fetch unique active supplier countries list on mount
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const res: any = await referenceApi.getCountries();
        const rawCountries = Array.isArray(res) ? res : (res?.data || []);
        
        const mapped = rawCountries.map((c: string) => {
          const lowerName = c.toLowerCase().trim();
          const knownCountries: Record<string, { code: string; image: string }> = {
            'bahrain': { code: 'BH', image: 'https://flagcdn.com/w40/bh.png' },
            'egypt': { code: 'EG', image: 'https://flagcdn.com/w40/eg.png' },
            'jordan': { code: 'JO', image: 'https://flagcdn.com/w40/jo.png' },
            'kuwait': { code: 'KW', image: 'https://flagcdn.com/w40/kw.png' },
            'morocco': { code: 'MA', image: 'https://flagcdn.com/w40/ma.png' },
            'oman': { code: 'OM', image: 'https://flagcdn.com/w40/om.png' },
            'qatar': { code: 'QA', image: 'https://flagcdn.com/w40/qa.png' },
            'saudi arabia': { code: 'SA', image: 'https://flagcdn.com/w40/sa.png' },
            'saudi': { code: 'SA', image: 'https://flagcdn.com/w40/sa.png' },
            'turkey': { code: 'TR', image: 'https://flagcdn.com/w40/tr.png' },
            'türkiye': { code: 'TR', image: 'https://flagcdn.com/w40/tr.png' },
            'united arab emirates': { code: 'AE', image: 'https://flagcdn.com/w40/ae.png' },
            'uae': { code: 'AE', image: 'https://flagcdn.com/w40/ae.png' },
            'romania': { code: 'RO', image: 'https://flagcdn.com/w40/ro.png' },
            'canada': { code: 'CA', image: 'https://flagcdn.com/w40/ca.png' },
            'indonesia': { code: 'ID', image: 'https://flagcdn.com/w40/id.png' },
            'venezuela': { code: 'VE', image: 'https://flagcdn.com/w40/ve.png' },
            'montenegro': { code: 'ME', image: 'https://flagcdn.com/w40/me.png' },
            'dominican republic': { code: 'DO', image: 'https://flagcdn.com/w40/do.png' },
            'bosnia and herzegovina': { code: 'BA', image: 'https://flagcdn.com/w40/ba.png' },
            'portugal': { code: 'PT', image: 'https://flagcdn.com/w40/pt.png' },
            'malta': { code: 'MT', image: 'https://flagcdn.com/w40/mt.png' },
            'albania': { code: 'AL', image: 'https://flagcdn.com/w40/al.png' },
            'grenada': { code: 'GD', image: 'https://flagcdn.com/w40/gd.png' },
            'ukraine': { code: 'UA', image: 'https://flagcdn.com/w40/ua.png' },
            'latvia': { code: 'LV', image: 'https://flagcdn.com/w40/lv.png' },
            'slovakia': { code: 'SK', image: 'https://flagcdn.com/w40/sk.png' },
            'iceland': { code: 'IS', image: 'https://flagcdn.com/w40/is.png' },
            'cyprus': { code: 'CY', image: 'https://flagcdn.com/w40/cy.png' },
            'armenia': { code: 'AM', image: 'https://flagcdn.com/w40/am.png' },
            'australia': { code: 'AU', image: 'https://flagcdn.com/w40/au.png' },
            'mauritius': { code: 'MU', image: 'https://flagcdn.com/w40/mu.png' },
            'serbia': { code: 'RS', image: 'https://flagcdn.com/w40/rs.png' },
            'spain': { code: 'ES', image: 'https://flagcdn.com/w40/es.png' },
            'georgia': { code: 'GE', image: 'https://flagcdn.com/w40/ge.png' },
            'antigua and barbuda': { code: 'AG', image: 'https://flagcdn.com/w40/ag.png' },
            'italy': { code: 'IT', image: 'https://flagcdn.com/w40/it.png' },
            'fiji': { code: 'FJ', image: 'https://flagcdn.com/w40/fj.png' },
            'united kingdom': { code: 'GB', image: 'https://flagcdn.com/w40/gb.png' },
            'uk': { code: 'GB', image: 'https://flagcdn.com/w40/gb.png' },
            'argentina': { code: 'AR', image: 'https://flagcdn.com/w40/ar.png' },
            'liechtenstein': { code: 'LI', image: 'https://flagcdn.com/w40/li.png' },
            'azerbaijan': { code: 'AZ', image: 'https://flagcdn.com/w40/az.png' },
            'greece': { code: 'GR', image: 'https://flagcdn.com/w40/gr.png' },
            'puerto rico': { code: 'PR', image: 'https://flagcdn.com/w40/pr.png' },
            'chile': { code: 'CL', image: 'https://flagcdn.com/w40/cl.png' },
            'estonia': { code: 'EE', image: 'https://flagcdn.com/w40/ee.png' },
            'japan': { code: 'JP', image: 'https://flagcdn.com/w40/jp.png' },
            'kosovo': { code: 'XK', image: 'https://flagcdn.com/w40/xk.png' },
            'jamaica': { code: 'JM', image: 'https://flagcdn.com/w40/jm.png' },
            'new zealand': { code: 'NZ', image: 'https://flagcdn.com/w40/nz.png' },
            'hungary': { code: 'HU', image: 'https://flagcdn.com/w40/hu.png' },
            'guatemala': { code: 'GT', image: 'https://flagcdn.com/w40/gt.png' },
            'panama': { code: 'PA', image: 'https://flagcdn.com/w40/pa.png' },
            'bulgaria': { code: 'BG', image: 'https://flagcdn.com/w40/bg.png' },
            'croatia': { code: 'HR', image: 'https://flagcdn.com/w40/hr.png' },
            'north macedonia': { code: 'MK', image: 'https://flagcdn.com/w40/mk.png' },
            'mexico': { code: 'MX', image: 'https://flagcdn.com/w40/mx.png' },
            'nepal': { code: 'NP', image: 'https://flagcdn.com/w40/np.png' },
            'poland': { code: 'PL', image: 'https://flagcdn.com/w40/pl.png' },
            'saint martin': { code: 'MF', image: 'https://flagcdn.com/w40/mf.png' },
          };
          
          let code = 'UN';
          let image = 'https://flagcdn.com/w40/un.png';
          
          if (knownCountries[lowerName]) {
            code = knownCountries[lowerName].code;
            image = knownCountries[lowerName].image;
          }
          
          return {
            id: lowerName.replace(/\s+/g, '-'),
            name: c,
            image,
            code
          };
        });
        setCountriesList(mapped);
      } catch (err) {
        console.error("Failed to fetch countries:", err);
      }
    };
    fetchCountries();
  }, []);

  // Fetch unique suppliers for the selected country
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res: any = await profitApi.getSuppliers(filters.country !== "All" ? filters.country : undefined);
        const list = Array.isArray(res) ? res : (res?.data || []);
        const mapped = list
          .map((s: any) => ({
            id: s.id,
            name: s.company || s.name || `Supplier #${s.id}`
          }))
          .filter((s: any) => s.name && s.name.trim() !== "")
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        setSuppliersList(mapped);
      } catch (err) {
        console.error("Failed to fetch suppliers:", err);
      }
    };
    fetchSuppliers();
  }, [filters.country]);

  const handleFilterChange = (key: string, value: string) => {
    if (key === "country") {
      dispatch(setFilters({ country: value, searchQuery: "", page: 1 }));
    } else {
      dispatch(setFilters({ [key]: value, page: 1 }));
    }
  };

  const handleSearch = () => {
    setHasSearched(true);
    dispatch(loadSupplierAnalytics(filters));
  };

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

      {/* Filter bar */}
      <FilterBar
        filters={filters}
        onFilterChange={handleFilterChange}
        onSearch={handleSearch}
        loading={loading}
        countriesList={countriesList}
        suppliersList={suppliersList}
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

          {/* Table card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Supplier Comparison</h3>
                <p className="text-xs text-gray-400 mt-0.5">{data.length} result{data.length !== 1 ? "s" : ""} based on current filters</p>
              </div>

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

            {/* Pagination Controls */}
            {pagination && pagination.last_page > 1 && (
              <div className="px-5 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50 rounded-b-2xl">
                <span className="text-sm text-gray-500">
                  Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} total)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      dispatch(setFilters({ page: pagination.current_page - 1 }));
                      dispatch(loadSupplierAnalytics({ ...filters, page: pagination.current_page - 1 }));
                    }}
                    disabled={pagination.current_page === 1}
                    className="px-3 py-1.5 text-sm font-medium border border-gray-200 rounded-lg bg-white disabled:opacity-50 hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => {
                      dispatch(setFilters({ page: pagination.current_page + 1 }));
                      dispatch(loadSupplierAnalytics({ ...filters, page: pagination.current_page + 1 }));
                    }}
                    disabled={pagination.current_page === pagination.last_page}
                    className="px-3 py-1.5 text-sm font-medium border border-gray-200 rounded-lg bg-white disabled:opacity-50 hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
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
