"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight, Wallet, Percent, Download, Search, Filter, Car, Save, Store } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsCard from "@/components/ui/StatsCard";
import { profitApi } from "@/services/api";
import ProfitFilters, { FilterItem } from "@/app/admin/components/profit/ProfitFilters";
import ProfitPercentageForm from "@/app/admin/components/profit/ProfitPercentageForm";
import VehicleProfitTable from "@/app/admin/components/profit/VehicleProfitTable";
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

export default function ProfitMarginsPage() {
  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [showNoProfitOnly, setShowNoProfitOnly] = useState(false);

  // Options State
  const [countries, setCountries] = useState<FilterItem[]>([]);
  const [suppliers, setSuppliers] = useState<FilterItem[]>([]);
  const [branches, setBranches] = useState<FilterItem[]>([]);
  const [vehiclesList, setVehiclesList] = useState<FilterItem[]>([]);

  // Vehicles State
  const [vehicles, setVehicles] = useState<VehicleProfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  // Fetch Main Data
  const fetchData = useCallback(() => {
    setIsLoading(true);
    
    // Always fetch page 1 with all applied filters to show the matching vehicles
    const params: any = {
      page: 1,
      per_page: 10000 // Fetch all items to support local pagination
    };
    
    if (searchQuery) params.search = searchQuery;
    if (selectedCountry) params.country = selectedCountry;
    if (selectedSupplier) params.supplier = selectedSupplier;
    if (selectedBranch) params.branch = selectedBranch;
    if (selectedVehicle) params.selectedVehicles = [selectedVehicle]; // API expects array of IDs
    if (showNoProfitOnly) params.no_profit = 'true';

    profitApi.getAll(params)
      .then((res: any) => {
        const items = Array.isArray(res?.data?.data) ? res.data.data
          : Array.isArray(res?.data) ? res.data
          : Array.isArray(res) ? res
          : [];

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
  }, [searchQuery, selectedCountry, selectedSupplier, selectedBranch, selectedVehicle]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Auto fetch when filters change

  // Local filtering is removed since API handles it now
  const filteredVehicles = vehicles;

  // Stats
  const totalVehicles = filteredVehicles.length;
  const avgMargin =
    filteredVehicles.length > 0
      ? filteredVehicles.reduce((sum, v) => sum + v.profit1_2 + v.profit3_7 + v.profit8_30 + v.profitWeekend, 0) /
        (filteredVehicles.length * 4)
      : 0;
  const savedCount = filteredVehicles.filter((v) => v.isSaved).length;
  const activeBranches = new Set(filteredVehicles.map((v) => v.branch)).size;

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
      // Backend expects: priceTax, weekPriceTax, monthPriceTax, weekendPriceTax, selectedVehicles
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
    if (filteredVehicles.length === 0) return;

    const idsToUpdate = new Set(filteredVehicles.map((v) => v.id));
    const updatedVehicles = vehicles.map((v) => {
      if (idsToUpdate.has(v.id)) {
        return {
          ...v,
          profit1_2: percentages.days1_2 ? parseInt(percentages.days1_2) : v.profit1_2,
          profit3_7: percentages.days3_7 ? parseInt(percentages.days3_7) : v.profit3_7,
          profit8_30: percentages.days8_30 ? parseInt(percentages.days8_30) : v.profit8_30,
          profitWeekend: percentages.weekend ? parseInt(percentages.weekend) : v.profitWeekend,
          isSaved: true,
        };
      }
      return v;
    });

    const first = updatedVehicles.find(v => idsToUpdate.has(v.id));
    if (!first) return;

    try {
      await profitApi.upload({
        priceTax: first.profit1_2,
        weekPriceTax: first.profit3_7,
        monthPriceTax: first.profit8_30,
        weekendPriceTax: first.profitWeekend,
        selectedVehicles: [...idsToUpdate].join(','),
      });
      toast.success(`Profit margins updated for ${idsToUpdate.size} vehicles!`);
    } catch (e: any) {
      console.warn("Failed to upload global profit:", e.message);
      toast.error("Failed to update margins. Please try again.");
    }
    setVehicles(updatedVehicles);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCountry("");
    setSelectedSupplier("");
    setSelectedBranch("");
    setSelectedVehicle("");
  };

  return (
    <SectionLayout>
      {/* Page Header */}
      <PageHeader
        title="Profit Margins"
        description="Manage vehicle pricing margins"
        showAction={false}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard label="Total Vehicles" value={totalVehicles} icon={<Car size={20} />} change="+12%" color="blue" />
        <StatsCard label="Avg Margin" value={`${avgMargin.toFixed(1)}%`} icon={<Percent size={20} />} change="+5%" color="emerald" />
        <StatsCard label="Saved Rules" value={savedCount} icon={<Save size={20} />} change="+8" color="purple" />
        <StatsCard label="Active Branches" value={activeBranches} icon={<Store size={20} />} color="amber" />
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
        onSearchClick={fetchData}
      />

      {/* Profit Percentage Form */}
      <ProfitPercentageForm onSubmit={handleGlobalSubmit} />

      {/* Vehicle Table */}
      <VehicleProfitTable
        vehicles={filteredVehicles}
        onUpdateVehicle={handleVehicleProfitChange}
        onSaveRow={handleSaveRow}
        onClearFilters={clearFilters}
      />
    </SectionLayout>
  );
}
