"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CheckCircle2, Car, ListChecks, AlertTriangle, Store } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsCard from "@/components/ui/StatsCard";
import { vehicleInclusionsApi, includedApi, profitApi } from "@/services/api";
import ProfitFilters, { FilterItem } from "@/app/admin/components/profit/ProfitFilters";
import InclusionsBulkForm from "@/app/admin/components/inclusions/InclusionsBulkForm";
import VehicleInclusionsTable, { VehicleInclusion } from "@/app/admin/components/inclusions/VehicleInclusionsTable";
import Pagination from "@/components/ui/Pagination";
import toast from "react-hot-toast";
import { getVehicleImageUrl } from "@/utils/getImageUrl";

interface IncludedFeature {
  id: number;
  name: string;
}

const ITEMS_PER_PAGE = 12;

export default function BulkInclusionsSection() {
  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [showNoInclusionsOnly, setShowNoInclusionsOnly] = useState(false);

  // Server-side pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Options State
  const [countries, setCountries] = useState<FilterItem[]>([]);
  const [suppliers, setSuppliers] = useState<FilterItem[]>([]);
  const [branches, setBranches] = useState<FilterItem[]>([]);
  const [vehiclesList, setVehiclesList] = useState<FilterItem[]>([]);

  // All available "What's Included" features
  const [allFeatures, setAllFeatures] = useState<IncludedFeature[]>([]);

  // Vehicles State (current page only)
  const [vehicles, setVehicles] = useState<VehicleInclusion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

  // Track current filters in a ref to reset page when they change
  const filtersRef = useRef({
    searchQuery,
    selectedCountry,
    selectedSupplier,
    selectedBranch,
    selectedVehicle,
    showNoInclusionsOnly,
  });

  // ── Load all "What's Included" features ─────────────────────────────
  useEffect(() => {
    includedApi.getAll().then((res: any) => {
      const data = Array.isArray(res) ? res : res?.data || [];
      setAllFeatures(
        data.map((item: any) => ({
          id: item.id,
          name: item.what_is_included || item.name || "",
        }))
      );
    }).catch(() => {
      // Features will be empty
    });
  }, []);

  // ── Load filter options (reuse same API as Profit page) ─────────────
  useEffect(() => {
    profitApi.getCountries().then((res: any) => {
      const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
      setCountries(data.map((item: any) => ({ id: item, name: item })));
    }).catch(() => {});
  }, []);

  const fetchSuppliers = useCallback(() => {
    if (selectedCountry) {
      profitApi.getSuppliers(selectedCountry).then((res: any) => {
        const data = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setSuppliers(data.map((item: any) => ({ id: String(item.id), name: item.name })));
      }).catch(() => {});
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
      }).catch(() => {});
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
      }).catch(() => {});
    } else {
      setVehiclesList([]);
    }
  }, [selectedSupplier, selectedBranch]);

  useEffect(() => {
    fetchVehiclesList();
    setSelectedVehicle("");
  }, [fetchVehiclesList]);

  // ── Main Data Fetch (server-side pagination) ──────────────────────────
  const fetchData = useCallback(
    (page: number = 1) => {
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
      if (showNoInclusionsOnly) params.no_inclusions = "true";

      vehicleInclusionsApi
        .getAll(params)
        .then((res: any) => {
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
              supplier: item.supplier_name || item.supplier || "—",
              branch: item.branch_name || item.branch || "—",
              included: Array.isArray(item.included)
                ? item.included.map((inc: any) => ({
                    id: inc.id ?? inc.included_id,
                    name: inc.name ?? inc.what_is_included ?? "",
                  }))
                : [],
            }))
          );
        })
        .catch((err) => {
          toast.error("Failed to load vehicles.");
        })
        .finally(() => setIsLoading(false));
    },
    [searchQuery, selectedCountry, selectedSupplier, selectedBranch, selectedVehicle, showNoInclusionsOnly]
  );

  // Reset to page 1 when filters change, then fetch
  useEffect(() => {
    const prev = filtersRef.current;
    const filtersChanged =
      prev.searchQuery !== searchQuery ||
      prev.selectedCountry !== selectedCountry ||
      prev.selectedSupplier !== selectedSupplier ||
      prev.selectedBranch !== selectedBranch ||
      prev.selectedVehicle !== selectedVehicle ||
      prev.showNoInclusionsOnly !== showNoInclusionsOnly;

    filtersRef.current = {
      searchQuery,
      selectedCountry,
      selectedSupplier,
      selectedBranch,
      selectedVehicle,
      showNoInclusionsOnly,
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

  // ── Stats ─────────────────────────────────────────────────────────────
  const withInclusions = vehicles.filter((v) => v.included.length > 0).length;
  const withoutInclusions = vehicles.filter((v) => v.included.length === 0).length;
  const activeBranches = new Set(vehicles.map((v) => v.branch)).size;

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleBulkSubmit = async (selectedIds: number[]) => {
    if (vehicles.length === 0) return;

    const idsToUpdate = vehicles.map((v) => v.id);
    setIsBulkUpdating(true);

    try {
      await vehicleInclusionsApi.bulkUpdate({
        selectedVehicles: idsToUpdate.join(","),
        included_ids: selectedIds,
      });
      toast.success(`Inclusions updated for ${idsToUpdate.length} vehicles on this page!`);
      fetchData(currentPage);
    } catch {
      toast.error("Failed to update inclusions. Please try again.");
    } finally {
      setIsBulkUpdating(false);
    }
  };

  const handleSaveRow = async (vehicleId: number, includedIds: number[]) => {
    try {
      await vehicleInclusionsApi.updateSingle({
        vehicle_id: vehicleId,
        included_ids: includedIds,
      });
      toast.success("Vehicle inclusions saved!");
      // Update local state immediately
      setVehicles((prev) =>
        prev.map((v) =>
          v.id === vehicleId
            ? {
                ...v,
                included: allFeatures.filter((f) => includedIds.includes(f.id)),
              }
            : v
        )
      );
    } catch {
      toast.error("Failed to save. Please try again.");
    }
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCountry("");
    setSelectedSupplier("");
    setSelectedBranch("");
    setSelectedVehicle("");
    setShowNoInclusionsOnly(false);
  };

  return (
    <SectionLayout>
      {/* Page Header */}
      <PageHeader
        title="Bulk Vehicle Inclusions"
        description={`Manage "What's Included" features for vehicles — ${totalCount} vehicles total`}
        showAction={false}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard label="Total Vehicles" value={totalCount} icon={<Car size={20} />} color="blue" />
        <StatsCard
          label="With Inclusions"
          value={withInclusions}
          icon={<CheckCircle2 size={20} />}
          color="emerald"
        />
        <StatsCard
          label="Without Inclusions"
          value={withoutInclusions}
          icon={<AlertTriangle size={20} />}
          color="amber"
        />
        <StatsCard label="Branches (page)" value={activeBranches} icon={<Store size={20} />} color="purple" />
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
        showNoProfitOnly={showNoInclusionsOnly}
        onToggleNoProfit={setShowNoInclusionsOnly}
        onClearFilters={clearFilters}
        onSearchClick={() => fetchData(1)}
      />

      {/* Bulk Inclusion Form */}
      <InclusionsBulkForm
        allFeatures={allFeatures}
        onSubmit={handleBulkSubmit}
        isLoading={isBulkUpdating}
      />

      {/* Loading State */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500 font-medium">Loading vehicles...</p>
        </div>
      ) : (
        /* Vehicle Table */
        <VehicleInclusionsTable
          vehicles={vehicles}
          allFeatures={allFeatures}
          onSaveRow={handleSaveRow}
          onClearFilters={clearFilters}
        />
      )}

      {/* Server-side Pagination Footer */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl border border-gray-100 px-6 py-4 shadow-sm">
          <span className="text-xs font-bold text-gray-500">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} vehicles
          </span>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </SectionLayout>
  );
}
