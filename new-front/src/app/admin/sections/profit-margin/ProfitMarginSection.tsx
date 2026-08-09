"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { DollarSign, Wallet, Percent, Save, Store, Car } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsCard from "@/components/ui/StatsCard";
import { profitApi } from "@/services/api";
import ProfitFilters, { FilterItem } from "@/app/admin/components/profit/ProfitFilters";
import ProfitPercentageForm from "@/app/admin/components/profit/ProfitPercentageForm";
import VehicleProfitTable from "@/app/admin/components/profit/VehicleProfitTable";
import Pagination from "@/components/ui/Pagination";
import toast from "react-hot-toast";
import { getVehicleImageUrl } from "@/utils/getImageUrl";

interface VehicleProfit {
  id: number;
  name: string;
  image: string;
  country: string;
  supplier: string;
  branch: string;
  profit1_2: number;
  profit3_7: number;
  profit8_30: number;
  profitWeekend: number;
  isSaved: boolean;
  hasMargin?: boolean;
}

const ITEMS_PER_PAGE = 12;

export default function ProfitMarginsPage() {
  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showNoProfitOnly, setShowNoProfitOnly] = useState(false);

  // Server-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Options State
  const [countries, setCountries] = useState<FilterItem[]>([]);
  const [suppliers, setSuppliers] = useState<FilterItem[]>([]);
  const [branches, setBranches] = useState<FilterItem[]>([]);
  const [categories, setCategories] = useState<FilterItem[]>([]);

  // Vehicles State (current page only)
  const [vehicles, setVehicles] = useState<VehicleProfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rawApiResponse, setRawApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<string>("");

  // Track current filters in a ref to reset page when they change
  const filtersRef = useRef({ searchQuery, selectedCountry, selectedSupplier, selectedBranch, selectedCategory, showNoProfitOnly });

  // Fetch Options
  useEffect(() => {
    profitApi.getCountries().then((res: any) => {
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setCountries(data.map((item: any) => ({ id: item, name: item })));
    }).catch(console.error);

    profitApi.getCategories().then((res: any) => {
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setCategories(data.map((item: any) => ({ id: String(item.id), name: item.name })));
    }).catch(console.error);
  }, []);

  const fetchSuppliers = useCallback(() => {
    if (selectedCountry) {
      profitApi.getSuppliers(selectedCountry).then((res: any) => {
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setSuppliers(data.map((item: any) => ({ id: String(item.id), name: item.name })));
      }).catch(console.error);
    } else {
      setSuppliers([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    fetchSuppliers();
    setSelectedSupplier("");
  }, [fetchSuppliers]);

  const fetchBranches = useCallback(() => {
    if (selectedSupplier) {
      profitApi.getBranches(selectedSupplier, selectedCountry).then((res: any) => {
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setBranches(data.map((item: any) => ({ id: String(item.id), name: item.name })));
      }).catch(console.error);
    } else {
      setBranches([]);
    }
  }, [selectedSupplier, selectedCountry]);

  useEffect(() => {
    fetchBranches();
    setSelectedBranch("");
  }, [fetchBranches]);

  // ── Main Data Fetch (server-side pagination) ─────────────────────────────────
  const fetchData = useCallback((page: number = 1) => {
    setIsLoading(true);
    setApiError("");

    const params: any = {
      page,
      per_page: ITEMS_PER_PAGE,
    };

    if (searchQuery) params.search = searchQuery;
    if (selectedCountry) params.country = selectedCountry;
    if (selectedSupplier) params.supplier = selectedSupplier;
    if (selectedBranch) params.branch = selectedBranch;
    if (selectedCategory) params.category = selectedCategory;
    if (showNoProfitOnly) params.no_profit = "true";

    profitApi.getAll(params)
      .then((res: any) => {
        setRawApiResponse(res);
        const items: any[] = Array.isArray(res?.data) ? res.data
          : Array.isArray(res) ? res
          : [];

        setTotalPages(res?.last_page || 1);
        setTotalCount(res?.total || items.length);
        setCurrentPage(res?.current_page || page);

        setVehicles(items.map((item: any) => ({
          id: item.vehicle_id ?? item.id,
          name: item.vehicle_name || item.name || "Unknown Vehicle",
          image: getVehicleImageUrl(item.photo || item.image || ""),
          country: item.branch_country || item.country || "Unknown",
          supplier: item.supplier_name || item.supplier?.name || item.supplier || "—",
          branch: item.branch_name || item.branch?.name || item.branch || "—",
          profit1_2: parseFloat(item.per_day_profit ?? item.profit1_2 ?? 0),
          profit3_7: parseFloat(item.per_week_profit ?? item.profit3_7 ?? 0),
          profit8_30: parseFloat(item.per_month_profit ?? item.profit8_30 ?? 0),
          profitWeekend: parseFloat(item.weekend_profit ?? item.profitWeekend ?? 0),
          isSaved: true,
          hasMargin: item.per_day_profit !== null && item.per_day_profit !== undefined,
        })));
      })
      .catch((err) => {
        console.warn("Failed to load profit margins:", err.message);
        setApiError(err.message || "Failed to load profit margins");
      })
      .finally(() => setIsLoading(false));
  }, [searchQuery, selectedCountry, selectedSupplier, selectedBranch, selectedCategory, showNoProfitOnly]);

  useEffect(() => {
    const prev = filtersRef.current;
    const filtersChanged =
      prev.searchQuery !== searchQuery ||
      prev.selectedCountry !== selectedCountry ||
      prev.selectedSupplier !== selectedSupplier ||
      prev.selectedBranch !== selectedBranch ||
      prev.selectedCategory !== selectedCategory ||
      prev.showNoProfitOnly !== showNoProfitOnly;

    filtersRef.current = { searchQuery, selectedCountry, selectedSupplier, selectedBranch, selectedCategory, showNoProfitOnly };

    if (filtersChanged) {
      setCurrentPage(1);
      fetchData(1);
    } else {
      fetchData(currentPage);
    }
  }, [fetchData]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchData(page);
  }, [fetchData]);

  const avgMargin =
    vehicles.length > 0
      ? vehicles.reduce((sum, v) => sum + v.profit1_2 + v.profit3_7 + v.profit8_30 + v.profitWeekend, 0) /
        (vehicles.length * 4)
      : 0;
  const savedCount = vehicles.filter((v) => v.isSaved).length;
  const activeBranches = new Set(vehicles.map((v) => v.branch)).size;

  const handleVehicleProfitChange = (
    id: number,
    field: keyof Omit<VehicleProfit, "id" | "name" | "image" | "country" | "supplier" | "branch" | "isSaved">,
    value: string
  ) => {
    if (value === "" || /^\d*$/.test(value)) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === id ? { ...v, [field]: value === "" ? 0 : parseInt(value), isSaved: false } : v
        )
      );
    }
  };

  const handleSaveRow = async (id: number) => {
    const vehicle = vehicles.find((v) => v.id === id);
    if (!vehicle) return;
    try {
      await profitApi.upload({
        priceTax: vehicle.profit1_2,
        weekPriceTax: vehicle.profit3_7,
        monthPriceTax: vehicle.profit8_30,
        weekendPriceTax: vehicle.profitWeekend,
        selectedVehicles: String(vehicle.id),
      });
      setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, isSaved: true } : v)));
      toast.success("Profit margin saved!");
    } catch (e: any) {
      console.warn("Failed to save row:", e.message);
      toast.error("Failed to save. Please try again.");
    }
  };

  const handleGlobalSubmit = async (percentages: { days1_2: string; days3_7: string; days8_30: string; weekend: string }) => {
    if (vehicles.length === 0) return;

    const idsToUpdate = new Set(vehicles.map((v) => v.id));

    try {
      await profitApi.upload({
        priceTax: percentages.days1_2 ? parseInt(percentages.days1_2) : 0,
        weekPriceTax: percentages.days3_7 ? parseInt(percentages.days3_7) : 0,
        monthPriceTax: percentages.days8_30 ? parseInt(percentages.days8_30) : 0,
        weekendPriceTax: percentages.weekend ? parseInt(percentages.weekend) : 0,
        selectedVehicles: [...idsToUpdate].join(","),
      });
      toast.success(`Profit margins updated for ${idsToUpdate.size} vehicles on this page!`);
      fetchData(currentPage);
    } catch (e: any) {
      console.warn("Failed to upload global profit:", e.message);
      toast.error("Failed to update margins. Please try again.");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCountry("");
    setSelectedSupplier("");
    setSelectedBranch("");
    setSelectedCategory("");
    setShowNoProfitOnly(false);
  };

  return (
    <SectionLayout>
      <PageHeader
        title="Profit Margin Settings"
        description="Set profit percentage margins per vehicle category"
      />

      <div className="space-y-6 pb-12">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatsCard
            label="Total Vehicles"
            value={totalCount}
            icon={<DollarSign size={20} className="text-blue-600" />}
            color="blue"
          />
          <StatsCard
            label="Avg Margin %"
            value={`${avgMargin.toFixed(1)}%`}
            icon={<Percent size={20} className="text-emerald-600" />}
            color="emerald"
          />
          <StatsCard
            label="Saved Vehicles"
            value={savedCount}
            icon={<Wallet size={20} className="text-amber-600" />}
            color="amber"
          />
          <StatsCard
            label="Active Branches"
            value={activeBranches}
            icon={<Store size={20} className="text-purple-600" />}
            color="purple"
          />
        </div>

        {/* Global Profit Form */}
        <ProfitPercentageForm onSubmit={handleGlobalSubmit} />

        {/* Filters */}
        <ProfitFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCountry={selectedCountry}
          onCountryChange={setSelectedCountry}
          countries={countries}
          selectedSupplier={selectedSupplier}
          onSupplierChange={setSelectedSupplier}
          suppliers={suppliers}
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranch}
          branches={branches}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categories={categories}
          showNoProfitOnly={showNoProfitOnly}
          onToggleNoProfit={(val) => setShowNoProfitOnly(val)}
          onClearFilters={clearFilters}
          onSearchClick={() => fetchData(1)}
        />

        {/* Error Alert */}
        {apiError && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm flex items-center justify-between">
            <span>Notice: {apiError}. Showing cached or local data.</span>
            <button
              onClick={() => fetchData(currentPage)}
              className="px-3 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg font-medium text-xs transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Vehicles Table */}
        {isLoading ? (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-gray-500">
            <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium">Loading vehicle profit margins…</p>
          </div>
        ) : (
          <>
            <VehicleProfitTable
              vehicles={vehicles}
              onUpdateVehicle={handleVehicleProfitChange}
              onSaveRow={handleSaveRow}
              onClearFilters={clearFilters}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pt-2">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </SectionLayout>
  );
}
