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

const ITEMS_PER_PAGE = 15;

export default function ProfitMarginsPage() {
  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [showNoProfitOnly, setShowNoProfitOnly] = useState(false);

  // Server-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Options State
  const [countries, setCountries] = useState<FilterItem[]>([]);
  const [suppliers, setSuppliers] = useState<FilterItem[]>([]);
  const [branches, setBranches] = useState<FilterItem[]>([]);
  const [vehiclesList, setVehiclesList] = useState<FilterItem[]>([]);

  // Vehicles State (current page only)
  const [vehicles, setVehicles] = useState<VehicleProfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Track current filters in a ref to reset page when they change
  const filtersRef = useRef({ searchQuery, selectedCountry, selectedSupplier, selectedBranch, selectedVehicle, showNoProfitOnly });

  // Fetch Options
  useEffect(() => {
    profitApi.getCountries().then((res: any) => {
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setCountries(data.map((item: any) => ({ id: item, name: item })));
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
      profitApi.getBranches(selectedSupplier).then((res: any) => {
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setBranches(data.map((item: any) => ({ id: String(item.id), name: item.name })));
      }).catch(console.error);
    } else {
      setBranches([]);
    }
  }, [selectedSupplier]);

  useEffect(() => {
    fetchBranches();
    setSelectedBranch("");
  }, [fetchBranches]);

  const fetchVehiclesList = useCallback(() => {
    if (selectedBranch) {
      profitApi.getVehicles(selectedSupplier, selectedBranch).then((res: any) => {
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setVehiclesList(data.map((item: any) => ({ id: String(item.id), name: item.name })));
      }).catch(console.error);
    } else {
      setVehiclesList([]);
    }
  }, [selectedSupplier, selectedBranch]);

  useEffect(() => {
    fetchVehiclesList();
    setSelectedVehicle("");
  }, [fetchVehiclesList]);

  // ── Main Data Fetch (server-side pagination) ─────────────────────────────────
  const fetchData = useCallback((page: number = 1) => {
    setIsLoading(true);

    const params: any = {
      page,
      per_page: ITEMS_PER_PAGE,
    };

    if (searchQuery) params.search = searchQuery;
    if (selectedCountry) params.country = selectedCountry;
    if (selectedSupplier) params.supplier = selectedSupplier;
    if (selectedBranch) params.branch = selectedBranch;
    if (selectedVehicle) params.selectedVehicles = [selectedVehicle];
    if (showNoProfitOnly) params.no_profit = "true";

    profitApi.getAll(params)
      .then((res: any) => {
        // Backend returns Laravel paginated: { data:[...], total, last_page, current_page }
        const raw = res?.data ?? res;
        const items: any[] = Array.isArray(raw?.data) ? raw.data
          : Array.isArray(raw) ? raw
          : [];

        setTotalPages(raw?.last_page || 1);
        setTotalCount(raw?.total || items.length);
        setCurrentPage(raw?.current_page || page);

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
      })
      .finally(() => setIsLoading(false));
  }, [searchQuery, selectedCountry, selectedSupplier, selectedBranch, selectedVehicle, showNoProfitOnly]);

  // Reset to page 1 when filters change, then fetch
  useEffect(() => {
    const prev = filtersRef.current;
    const filtersChanged =
      prev.searchQuery !== searchQuery ||
      prev.selectedCountry !== selectedCountry ||
      prev.selectedSupplier !== selectedSupplier ||
      prev.selectedBranch !== selectedBranch ||
      prev.selectedVehicle !== selectedVehicle ||
      prev.showNoProfitOnly !== showNoProfitOnly;

    filtersRef.current = { searchQuery, selectedCountry, selectedSupplier, selectedBranch, selectedVehicle, showNoProfitOnly };

    if (filtersChanged) {
      setCurrentPage(1);
      fetchData(1);
    } else {
      fetchData(currentPage);
    }
  }, [fetchData]);

  // Fetch when page changes (but not when filters change — that's handled above)
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    fetchData(page);
  }, [fetchData]);

  // Stats (computed from current page — totals come from server)
  const avgMargin =
    vehicles.length > 0
      ? vehicles.reduce((sum, v) => sum + v.profit1_2 + v.profit3_7 + v.profit8_30 + v.profitWeekend, 0) /
        (vehicles.length * 4)
      : 0;
  const savedCount = vehicles.filter((v) => v.isSaved).length;
  const activeBranches = new Set(vehicles.map((v) => v.branch)).size;

  // Handlers
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
    setSelectedVehicle("");
    setShowNoProfitOnly(false);
  };

  return (
    <SectionLayout>
      {/* Page Header */}
      <PageHeader
        title="Profit Margins"
        description={`Manage vehicle pricing margins — ${totalCount} vehicles total`}
        showAction={false}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard label="Total Vehicles" value={totalCount} icon={<Car size={20} />} color="blue" />
        <StatsCard label="Avg Margin (page)" value={`${avgMargin.toFixed(1)}%`} icon={<Percent size={20} />} color="emerald" />
        <StatsCard label="Saved (page)" value={savedCount} icon={<Save size={20} />} color="purple" />
        <StatsCard label="Branches (page)" value={activeBranches} icon={<Store size={20} />} color="amber" />
      </div>

      {/* Filters */}
      <ProfitFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCountry={selectedCountry}
        onCountryChange={setSelectedCountry}
        selectedSupplier={selectedSupplier}
        onSupplierChange={setSelectedSupplier}
        selectedBranch={selectedBranch}
        onBranchChange={setSelectedBranch}
        selectedVehicle={selectedVehicle}
        onVehicleChange={setSelectedVehicle}
        countries={countries}
        suppliers={suppliers}
        branches={branches}
        vehiclesList={vehiclesList}
        showNoProfitOnly={showNoProfitOnly}
        onToggleNoProfit={setShowNoProfitOnly}
        onClearFilters={clearFilters}
        onSearchClick={() => fetchData(1)}
      />

      {/* Profit Percentage Form */}
      <ProfitPercentageForm onSubmit={handleGlobalSubmit} />

      {/* Vehicle Table */}
      <VehicleProfitTable
        vehicles={vehicles}
        onUpdateVehicle={handleVehicleProfitChange}
        onSaveRow={handleSaveRow}
        onClearFilters={clearFilters}
      />

      {/* Server-side Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 px-6 py-4 shadow-sm">
          <span className="text-xs font-bold text-gray-500">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} vehicles
          </span>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </SectionLayout>
  );
}
