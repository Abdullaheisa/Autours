"use client";

import { useState, useMemo } from "react";
import { Car, Percent, Save, Store, TrendingUp } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsCard from "@/components/ui/StatsCard";
import ProfitFilters from "@/app/admin/components/profit/ProfitFilters";
import ProfitPercentageForm from "@/app/admin/components/profit/ProfitPercentageForm";
import VehicleProfitTable, { VehicleProfit } from "@/app/admin/components/profit/VehicleProfitTable";

// Mock Data
const mockVehicles: VehicleProfit[] = [
  { id: 1, name: "Nissan Sunny Automatic", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=150&h=100&fit=crop", country: "Egypt", supplier: "Nile Motors", branch: "Hurghada International Airport", profit1_2: 15, profit3_7: 12, profit8_30: 10, profitWeekend: 20, isSaved: true },
  { id: 2, name: "Peugeot 301 Automatic", image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=150&h=100&fit=crop", country: "Egypt", supplier: "Nile Motors", branch: "Hurghada International Airport", profit1_2: 18, profit3_7: 15, profit8_30: 12, profitWeekend: 22, isSaved: true },
  { id: 3, name: "Renault Logan Automatic", image: "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=150&h=100&fit=crop", country: "Egypt", supplier: "Cairo Wheels", branch: "Hurghada International Airport", profit1_2: 14, profit3_7: 11, profit8_30: 9, profitWeekend: 18, isSaved: true },
  { id: 4, name: "Toyota Camry", image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=150&h=100&fit=crop", country: "UAE", supplier: "MAHD Rent", branch: "Dubai Airport", profit1_2: 25, profit3_7: 22, profit8_30: 18, profitWeekend: 28, isSaved: false },
  { id: 5, name: "BMW X5", image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=150&h=100&fit=crop", country: "Saudi Arabia", supplier: "Autocar Elite", branch: "Riyadh Airport", profit1_2: 30, profit3_7: 28, profit8_30: 25, profitWeekend: 35, isSaved: false },
  { id: 6, name: "Mercedes C-Class", image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=150&h=100&fit=crop", country: "Qatar", supplier: "Doha Wheels", branch: "Doha Airport", profit1_2: 35, profit3_7: 32, profit8_30: 28, profitWeekend: 40, isSaved: false },
  { id: 7, name: "Hyundai Tucson", image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=150&h=100&fit=crop", country: "Kuwait", supplier: "Kuwait Ride", branch: "Kuwait City", profit1_2: 20, profit3_7: 18, profit8_30: 15, profitWeekend: 25, isSaved: false },
  { id: 8, name: "Kia Sportage", image: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=150&h=100&fit=crop", country: "Jordan", supplier: "Jordan Cars", branch: "Amman Airport", profit1_2: 22, profit3_7: 20, profit8_30: 17, profitWeekend: 26, isSaved: false },
];

const countries = ["All Countries", "Egypt", "UAE", "Saudi Arabia", "Qatar", "Kuwait", "Jordan"];
const suppliers = ["All Suppliers", "Nile Motors", "MAHD Rent", "Autocar Elite", "Doha Wheels", "Kuwait Ride", "Jordan Cars", "Cairo Wheels"];
const branches = ["All Branches", "Hurghada International Airport", "Dubai Airport", "Riyadh Airport", "Doha Airport", "Kuwait City", "Amman Airport"];
const vehiclesList = ["All Vehicles", "Nissan Sunny Automatic", "Peugeot 301 Automatic", "Renault Logan Automatic", "Toyota Camry", "BMW X5", "Mercedes C-Class", "Hyundai Tucson", "Kia Sportage"];

export default function ProfitMarginsPage() {
  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All Countries");
  const [selectedSupplier, setSelectedSupplier] = useState("All Suppliers");
  const [selectedBranch, setSelectedBranch] = useState("All Branches");
  const [selectedVehicle, setSelectedVehicle] = useState("All Vehicles");

  // Vehicles State
  const [vehicles, setVehicles] = useState<VehicleProfit[]>(mockVehicles);

  // Filter Logic
  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      const matchesSearch =
        searchQuery === "" ||
        vehicle.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vehicle.branch.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = selectedCountry === "All Countries" || vehicle.country === selectedCountry;
      const matchesSupplier = selectedSupplier === "All Suppliers" || vehicle.supplier === selectedSupplier;
      const matchesBranch = selectedBranch === "All Branches" || vehicle.branch === selectedBranch;
      const matchesVehicle = selectedVehicle === "All Vehicles" || vehicle.name === selectedVehicle;

      return matchesSearch && matchesCountry && matchesSupplier && matchesBranch && matchesVehicle;
    });
  }, [vehicles, searchQuery, selectedCountry, selectedSupplier, selectedBranch, selectedVehicle]);

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

  const handleSaveRow = (id: number) => {
    setVehicles((prev) => prev.map((v) => (v.id === id ? { ...v, isSaved: true } : v)));
  };

  const handleGlobalSubmit = (percentages: { days1_2: string; days3_7: string; days8_30: string; weekend: string }) => {
    if (filteredVehicles.length === 0) return;

    const idsToUpdate = new Set(filteredVehicles.map((v) => v.id));

    setVehicles((prev) =>
      prev.map((v) => {
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
      })
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCountry("All Countries");
    setSelectedSupplier("All Suppliers");
    setSelectedBranch("All Branches");
    setSelectedVehicle("All Vehicles");
  };

  return (
    <SectionLayout>
      {/* Page Header */}
<PageHeader
  title="Profit Margins"
  description="Manage vehicle pricing margins"
  showAction={false}  // ← كده الزرار هيختفي
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
        onClearFilters={clearFilters}
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
