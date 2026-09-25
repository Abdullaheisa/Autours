"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { DollarSign, Wallet, Percent, Save, Store, Car } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsCard from "@/components/ui/StatsCard";
import { profitApi } from "@/services/api";
import ProfitFilters, { FilterItem, SupplierStatus } from "@/app/admin/components/profit/ProfitFilters";
import ProfitPercentageForm, { ProfitMarginsData } from "@/app/admin/components/profit/ProfitPercentageForm";
import VehicleProfitTable from "@/app/admin/components/profit/VehicleProfitTable";
import Pagination from "@/components/ui/Pagination";
import toast from "react-hot-toast";
import { getVehicleImageUrl } from "@/utils/getImageUrl";
import usePersistedPage from "@/hooks/usePersistedPage";

interface VehicleProfit {
  id: number;
  name: string;
  image: string;
  country: string;
  supplier: string;
  branch: string;
  currency?: string;
  basePrice: number;
  baseWeekPrice?: number;
  baseMonthPrice?: number;
  profit1_2: number;
  profit3_7: number;
  profit8_30: number;
  profitWeekend: number;
  discountPercent: number;
  isSaved: boolean;
  hasMargin?: boolean;
}

const ITEMS_PER_PAGE = 12;

export default function ProfitMarginsPage() {
  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [supplierStatus, setSupplierStatus] = useState<SupplierStatus>("active");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showNoProfitOnly, setShowNoProfitOnly] = useState(false);

  // Server-side pagination state
  const [currentPage, setCurrentPage] = usePersistedPage("admin_profit-margin", 1);
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
  const filtersRef = useRef({
    searchQuery,
    supplierStatus,
    selectedCountry,
    selectedSupplier,
    selectedBranch,
    selectedCategory,
    showNoProfitOnly,
  });

  // Fetch Options
  useEffect(() => {
    profitApi
      .getCountries()
      .then((res: any) => {
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setCountries(data.map((item: any) => ({ id: item, name: item })));
      })
      .catch(console.error);

    profitApi
      .getCategories()
      .then((res: any) => {
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setCategories(data.map((item: any) => ({ id: String(item.id), name: item.name })));
      })
      .catch(console.error);
  }, []);

  const fetchSuppliers = useCallback(() => {
    profitApi
      .getSuppliers(selectedCountry || undefined, supplierStatus)
      .then((res: any) => {
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setSuppliers(data.map((item: any) => ({ id: String(item.id), name: item.name })));
      })
      .catch(console.error);
  }, [selectedCountry, supplierStatus]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const fetchBranches = useCallback(() => {
    profitApi
      .getBranches(selectedSupplier || undefined, selectedCountry || undefined)
      .then((res: any) => {
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setBranches(data.map((item: any) => ({ id: String(item.id), name: item.name })));
      })
      .catch(console.error);
  }, [selectedSupplier, selectedCountry]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // ── Main Data Fetch (server-side pagination) ─────────────────────────────────
  const fetchData = useCallback(
    (page: number = 1) => {
      setIsLoading(true);
      setApiError("");

      const params: any = {
        page,
        per_page: ITEMS_PER_PAGE,
      };

      if (searchQuery) params.search = searchQuery;
      if (supplierStatus) params.supplier_status = supplierStatus;
      if (selectedCountry) params.country = selectedCountry;
      if (selectedSupplier) params.supplier = selectedSupplier;
      if (selectedBranch) params.branch = selectedBranch;
      if (selectedCategory) params.category = selectedCategory;
      if (showNoProfitOnly) params.no_profit = "true";

      profitApi
        .getAll(params)
        .then((res: any) => {
          setRawApiResponse(res);
          const items: any[] = Array.isArray(res?.data)
            ? res.data
            : Array.isArray(res)
            ? res
            : [];

          setTotalPages(res?.last_page || 1);
          setTotalCount(res?.total || items.length);
          setCurrentPage(res?.current_page || page);

          setVehicles(
            items.map((item: any) => ({
              id: item.vehicle_id ?? item.id,
              name: item.vehicle_name || item.name || "Unknown Vehicle",
              image: getVehicleImageUrl(item.photo || item.image || ""),
              country: item.branch_country || item.country || "Unknown",
              supplier: item.supplier_name || item.supplier?.name || item.supplier || "—",
              branch: item.branch_name || item.branch?.name || item.branch || "—",
              currency: item.currency || "USD",
              basePrice: parseFloat(item.base_price ?? 0),
              baseWeekPrice: parseFloat(item.base_week_price ?? 0),
              baseMonthPrice: parseFloat(item.base_month_price ?? 0),
              profit1_2: parseFloat(item.per_day_profit ?? item.profit1_2 ?? 0),
              profit3_7: parseFloat(item.per_week_profit ?? item.profit3_7 ?? 0),
              profit8_30: parseFloat(item.per_month_profit ?? item.profit8_30 ?? 0),
              profitWeekend: parseFloat(item.weekend_profit ?? item.profitWeekend ?? 0),
              discountPercent: parseFloat(item.discount_percent ?? 0),
              isSaved: true,
              hasMargin: item.per_day_profit !== null && item.per_day_profit !== undefined,
            }))
          );
        })
        .catch((err) => {
          console.warn("Failed to load profit margins:", err.message);
          setApiError(err.message || "Failed to load profit margins");
        })
        .finally(() => setIsLoading(false));
    },
    [
      searchQuery,
      supplierStatus,
      selectedCountry,
      selectedSupplier,
      selectedBranch,
      selectedCategory,
      showNoProfitOnly,
    ]
  );

  useEffect(() => {
    const prev = filtersRef.current;
    const filtersChanged =
      prev.searchQuery !== searchQuery ||
      prev.supplierStatus !== supplierStatus ||
      prev.selectedCountry !== selectedCountry ||
      prev.selectedSupplier !== selectedSupplier ||
      prev.selectedBranch !== selectedBranch ||
      prev.selectedCategory !== selectedCategory ||
      prev.showNoProfitOnly !== showNoProfitOnly;

    filtersRef.current = {
      searchQuery,
      supplierStatus,
      selectedCountry,
      selectedSupplier,
      selectedBranch,
      selectedCategory,
      showNoProfitOnly,
    };

    if (filtersChanged) {
      setCurrentPage(1);
      fetchData(1);
    } else {
      fetchData(currentPage);
    }
  }, [fetchData]);

  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page);
      fetchData(page);
    },
    [fetchData]
  );

  const avgMargin =
    vehicles.length > 0
      ? vehicles.reduce(
          (sum, v) => sum + v.profit1_2 + v.profit3_7 + v.profit8_30 + v.profitWeekend,
          0
        ) /
        (vehicles.length * 4)
      : 0;
  const savedCount = vehicles.filter((v) => v.isSaved).length;
  const activeBranches = new Set(vehicles.map((v) => v.branch)).size;

  const handleVehicleProfitChange = (
    id: number,
    field: keyof Omit<
      VehicleProfit,
      | "id"
      | "name"
      | "image"
      | "country"
      | "supplier"
      | "branch"
      | "currency"
      | "basePrice"
      | "baseWeekPrice"
      | "baseMonthPrice"
      | "isSaved"
      | "hasMargin"
    >,
    value: string
  ) => {
    if (value === "" || /^\d*(\.\d*)?$/.test(value)) {
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === id ? { ...v, [field]: value === "" ? 0 : parseFloat(value), isSaved: false } : v
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
        discount_percent: vehicle.discountPercent,
        selectedVehicles: String(vehicle.id),
      });
      setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, isSaved: true } : v)));
      toast.success("Vehicle pricing & discount saved!");
    } catch (e: any) {
      console.warn("Failed to save row:", e.message);
      toast.error("Failed to save. Please try again.");
    }
  };

  const handleApplyProfit = async (margins: ProfitMarginsData) => {
    if (vehicles.length === 0) return;

    const payload: any = {};
    if (margins.days1_2) payload.priceTax = parseFloat(margins.days1_2);
    if (margins.days3_7) payload.weekPriceTax = parseFloat(margins.days3_7);
    if (margins.days8_30) payload.monthPriceTax = parseFloat(margins.days8_30);
    if (margins.weekend) payload.weekendPriceTax = parseFloat(margins.weekend);

    if (selectedCountry) payload.country = selectedCountry;
    if (selectedSupplier) payload.supplier = selectedSupplier;
    if (selectedBranch) payload.branch = selectedBranch;
    if (selectedCategory) payload.category = selectedCategory;
    if (supplierStatus) payload.supplier_status = supplierStatus;

    const idsToUpdate = new Set(vehicles.map((v) => v.id));
    if (!selectedCountry && !selectedSupplier && !selectedBranch && !selectedCategory) {
      payload.selectedVehicles = [...idsToUpdate].join(",");
    }

    try {
      await profitApi.upload(payload);
      toast.success("Profit margins applied successfully!");
      fetchData(currentPage);
    } catch (e: any) {
      console.warn("Failed to upload global profit:", e.message);
      toast.error("Failed to update margins. Please try again.");
    }
  };

  const handleApplyDiscount = async (discount: string) => {
    if (vehicles.length === 0) return;
    if (discount === "" || isNaN(Number(discount))) {
      toast.error("Please enter a valid discount percentage");
      return;
    }

    const payload: any = {
      discount_percent: parseFloat(discount),
    };

    if (selectedCountry) payload.country = selectedCountry;
    if (selectedSupplier) payload.supplier = selectedSupplier;
    if (selectedBranch) payload.branch = selectedBranch;
    if (selectedCategory) payload.category = selectedCategory;
    if (supplierStatus) payload.supplier_status = supplierStatus;

    const idsToUpdate = new Set(vehicles.map((v) => v.id));
    if (!selectedCountry && !selectedSupplier && !selectedBranch && !selectedCategory) {
      payload.selectedVehicles = [...idsToUpdate].join(",");
    }

    try {
      await profitApi.upload(payload);
      toast.success(`Discount of ${discount}% applied successfully!`);
      fetchData(currentPage);
    } catch (e: any) {
      console.warn("Failed to upload discount:", e.message);
      toast.error("Failed to apply discount. Please try again.");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSupplierStatus("active");
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
        description="Set profit percentage margins and promotional discounts per vehicle category"
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

        {/* Global Profit & Discount Form */}
        <ProfitPercentageForm
          onApplyProfit={handleApplyProfit}
          onApplyDiscount={handleApplyDiscount}
        />

        {/* Filters */}
        <ProfitFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          supplierStatus={supplierStatus}
          onSupplierStatusChange={setSupplierStatus}
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
