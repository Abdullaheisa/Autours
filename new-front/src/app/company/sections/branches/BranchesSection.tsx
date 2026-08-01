"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
  Plus, Search, MapPin, Building, Activity,
  CalendarCheck, Filter, X, Loader2, Globe, ChevronDown, Plane
} from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsGrid from "@/app/company/components/StatsGrid";
import Pagination from "@/components/ui/Pagination";
import { ActionButtons } from "@/components/shared";
import { useSearch } from "../../context/SearchContext";
import { branchApi, vehicleApi } from "@/services/api";
import toast from "react-hot-toast";
import { LocationBranch } from "@/types";

interface Branch {
  id: number;
  name: string;
  country: string;
  address: string;
  location: string;
  status: "active" | "inactive";
  city?: string;
  phone?: string;
  email?: string;
  currency?: string;
}

interface BranchFormData {
  name: string;
  adresse: string;
  location: string;
  country: string;
  city: string;
  phone: string;
  email: string;
  currency: string;
  activation: boolean;
  location_type?: string;
  abriviation?: string;
  airport_id?: number | null;
}

const defaultForm: BranchFormData = {
  name: "",
  adresse: "",
  location: "",
  country: "",
  city: "",
  phone: "",
  email: "",
  currency: "USD",
  activation: true,
  location_type: "",
  abriviation: "",
  airport_id: null,
};

const CURRENCIES = ["USD", "AED", "SAR", "EGP", "QAR", "KWD", "BHD", "OMR", "JOD"];

// ─── Searchable Dropdown ──────────────────────────────────────────────
function SearchableDropdown({
  placeholder,
  value,
  options,
  onChange,
  icon: Icon,
  disabled = false,
}: {
  placeholder: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
  icon?: React.ElementType;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    return options.filter((o) =>
      o.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [options, query]);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setOpen((prev) => !prev);
            setQuery("");
          }
        }}
        className={`w-full flex items-center gap-2 pl-3 pr-3 py-2.5 bg-gray-50 border rounded-xl text-sm transition-all
          ${open ? "border-primary-400 ring-2 ring-primary-100" : "border-gray-200"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-gray-300 cursor-pointer"}
          ${value ? "text-gray-900" : "text-gray-400"}
        `}
      >
        {Icon && <Icon size={15} className={`shrink-0 ${value ? "text-primary-500" : "text-gray-400"}`} />}
        <span className="flex-1 text-left truncate font-medium">
          {selectedLabel || placeholder}
        </span>
        {value ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              onChange("");
              setOpen(false);
              setQuery("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                onChange("");
                setOpen(false);
                setQuery("");
              }
            }}
            className="shrink-0 w-4 h-4 rounded-full bg-gray-200 hover:bg-red-100 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors cursor-pointer"
          >
            <X size={10} />
          </span>
        ) : (
          <ChevronDown
            size={15}
            className={`shrink-0 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-[100] overflow-hidden">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search..."
                className="w-full pl-8 pr-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary-400"
              />
            </div>
          </div>
          <div className="max-h-52 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
                setQuery("");
              }}
              className={`w-full px-3 py-2.5 text-left text-xs font-bold transition-colors border-b border-gray-50
                ${!value ? "bg-primary-50 text-primary-700" : "text-gray-400 hover:bg-gray-50"}`}
            >
              All {placeholder.replace("Filter by ", "")}s
            </button>
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-center text-xs text-gray-400">No results found</div>
            ) : (
              filtered.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                    setQuery("");
                  }}
                  className={`w-full px-3 py-2.5 text-left text-sm transition-colors
                    ${value === opt.value
                      ? "bg-primary-50 text-primary-700 font-bold"
                      : "text-gray-700 hover:bg-gray-50 font-medium"
                    }`}
                >
                  {opt.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Add Branch Modal
// ─────────────────────────────────────────────
interface AddBranchModalProps {
  formData: BranchFormData;
  onChange: (data: BranchFormData) => void;
  onSubmit: () => void;
  onClose: () => void;
  isSubmitting: boolean;
  errorMsg: string;
  airports: LocationBranch[];
}

function AddBranchModal({
  formData, onChange, onSubmit, onClose,
  isSubmitting, errorMsg, airports
}: AddBranchModalProps) {
  const set = (field: keyof BranchFormData, value: any) =>
    onChange({ ...formData, [field]: value });

  const [openSelector, setOpenSelector] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenSelector(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const [selectedCountry, setSelectedCountry] = useState<string>(formData.country || "");

  const uniqueCountries = useMemo(() => {
    const countries = Array.from(new Set(airports.map(a => a.country).filter(Boolean)));
    return countries.sort().map(c => ({ value: c, label: c }));
  }, [airports]);

  const airportsForCountry = useMemo(() => {
    if (!selectedCountry) return [];
    return airports.filter(a => a.country === selectedCountry);
  }, [airports, selectedCountry]);

  const filteredAirports = useMemo(() => {
    if (!query.trim()) return airportsForCountry.slice(0, 50); // Show max 50 initially
    return airportsForCountry
      .filter((a) =>
        (a.name?.toLowerCase() || "").includes(query.toLowerCase()) ||
        (a.location?.toLowerCase() || "").includes(query.toLowerCase()) ||
        (a.abriviation?.toLowerCase() || "").includes(query.toLowerCase())
      )
      .slice(0, 50);
  }, [airportsForCountry, query]);

  const handleSelectAirport = (airport: LocationBranch) => {
    onChange({
      ...formData,
      name: airport.name || "",
      location: airport.location || "",
      country: airport.country || "",
      city: airport.location || "",
      adresse: airport.adresse || airport.location_address || airport.name || "",
      location_type: airport.location_type || "Airport",
      abriviation: airport.abriviation || "",
      airport_id: airport.airport_id || airport.id || null,
    });
    setOpenSelector(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
              <Plane size={20} className="text-primary-600" />
            </div>
            <h2 className="text-lg font-black text-gray-900">Add New Branch</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 font-medium">
              {errorMsg}
            </div>
          )}

          {/* Country Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Select Country <span className="text-red-400">*</span>
            </label>
            <SearchableDropdown
              placeholder="Search for a country..."
              value={selectedCountry}
              options={uniqueCountries}
              onChange={(val) => {
                setSelectedCountry(val);
                if (formData.country !== val) {
                  onChange({
                    ...formData,
                    name: "",
                    location: "",
                    country: "",
                    city: "",
                    adresse: "",
                    abriviation: "",
                    airport_id: null,
                  });
                }
              }}
              icon={Globe}
            />
          </div>

          {/* Airport Selector */}
          <div className="space-y-1.5 relative" ref={dropdownRef}>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
              Select Airport <span className="text-red-400">*</span>
            </label>
            <button
              type="button"
              disabled={!selectedCountry}
              onClick={() => {
                if (selectedCountry) {
                  setOpenSelector((p) => !p);
                  if (!openSelector) setTimeout(() => inputRef.current?.focus(), 50);
                }
              }}
              className={`w-full flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm transition-all shadow-sm text-left
                ${!selectedCountry ? "opacity-50 cursor-not-allowed bg-gray-50" : "hover:border-primary-400 cursor-pointer"}`}
            >
              <Search size={16} className={`shrink-0 ${selectedCountry ? "text-gray-400" : "text-gray-300"}`} />
              <span className="flex-1 truncate font-medium text-gray-700">
                {!selectedCountry 
                  ? "Please select a country first" 
                  : formData.name 
                    ? `${formData.name} ${formData.abriviation ? `(${formData.abriviation})` : ""}` 
                    : "Search for an airport..."}
              </span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${openSelector ? "rotate-180" : ""}`} />
            </button>

            {openSelector && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden flex flex-col max-h-72">
                <div className="p-2 border-b border-gray-100 shrink-0">
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search airports by name, city, or IATA code..."
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary-400"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto flex-1 p-1">
                  {filteredAirports.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">No airports found</div>
                  ) : (
                    filteredAirports.map((apt) => (
                      <button
                        key={apt.id}
                        type="button"
                        onClick={() => handleSelectAirport(apt)}
                        className="w-full px-3 py-2.5 flex items-start gap-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                          <Plane size={14} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-900 truncate">
                            {apt.name} {apt.abriviation && <span className="text-xs text-gray-500 font-medium ml-1">({apt.abriviation})</span>}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5 truncate">
                            {apt.location && `${apt.location}, `}{apt.country}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Auto-filled details info box */}
          {formData.name && (
            <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800 space-y-1.5 animate-in fade-in slide-in-from-top-2">
              <div className="font-bold flex items-center gap-2">
                <MapPin size={16} className="text-blue-500" />
                Branch Details (Auto-filled)
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 text-xs">
                <div><span className="text-blue-600/70">Country:</span> <span className="font-medium">{formData.country}</span></div>
                <div><span className="text-blue-600/70">City:</span> <span className="font-medium">{formData.city}</span></div>
                <div className="col-span-2"><span className="text-blue-600/70">Address:</span> <span className="font-medium">{formData.adresse}</span></div>
              </div>
            </div>
          )}

          {/* Manual Fields */}
          <div className="pt-2 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Contact & Settings</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Phone <span className="text-red-400">*</span>
                </label>
                <input type="tel" value={formData.phone} onChange={(e) => set("phone", e.target.value)}
                  placeholder="+971 50 000 0000"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Email <span className="text-red-400">*</span>
                </label>
                <input type="email" value={formData.email} onChange={(e) => set("email", e.target.value)}
                  placeholder="branch@company.com"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
              </div>
            </div>

            <div className="space-y-1.5 mt-4 relative">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                Currency <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <select 
                  value={formData.currency} 
                  onChange={(e) => set("currency", e.target.value)}
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all cursor-pointer appearance-none"
                >
                  <option value="" disabled>Select Currency</option>
                  {CURRENCIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Activation toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200 mt-4">
              <div>
                <p className="text-sm font-bold text-gray-800">Active Branch</p>
                <p className="text-xs text-gray-500 mt-0.5">Visible to customers for bookings</p>
              </div>
              <button type="button" onClick={() => set("activation", !formData.activation)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  formData.activation ? "bg-primary-500" : "bg-gray-300"
                }`}>
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                  formData.activation ? "translate-x-6" : "translate-x-1"
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-5 border-t border-gray-100 shrink-0">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={isSubmitting || !formData.name.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.currency.trim()}
            className="flex-1 py-2.5 bg-primary-500 text-white font-bold text-sm rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving…
              </>
            ) : (
              "Save Branch"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Section
// ─────────────────────────────────────────────
export default function BranchesSection() {
  const { searchQuery } = useSearch();
  const [localSearch, setLocalSearch] = useState("");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [allAirports, setAllAirports] = useState<LocationBranch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedAddress, setSelectedAddress] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [localSearch, searchQuery, selectedCountry, selectedStatus, selectedAddress]);

  // Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addForm, setAddForm] = useState<BranchFormData>(defaultForm);
  const [modalError, setModalError] = useState("");

  // Fetch branches and airports
  const fetchBranches = useCallback(() => {
    setIsLoading(true);
    branchApi
      .getAll()
      .then((res: any) => {
        const data = res?.data?.data || res?.data || (Array.isArray(res) ? res : []);
        if (Array.isArray(data)) {
          const sortedData = [...data].sort((a: any, b: any) => b.id - a.id);
          setBranches(
            sortedData.map((b: any) => ({
              id: b.id,
              name: b.name || b.location || "Unnamed Branch",
              country: b.country || "",
              address: b.adresse || b.location_address || b.address || "",
              location: b.location || b.name || "",
              status: (b.activation == 1 || b.activation == true || b.activation === '1' || b.activation === 'true') ? "active" : "inactive",
              city: b.city || "",
              phone: b.phone || "",
              email: b.email || "",
              currency: b.currency || "USD",
            }))
          );
        }
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const fetchAirports = useCallback(() => {
    vehicleApi.getGlobalAirports().then((airports) => {
      if (airports && airports.length > 0) {
        setAllAirports(airports);
      }
    }).catch((err) => {
      console.error("Failed to load airports", err);
    });
  }, []);

  useEffect(() => {
    fetchBranches();
    fetchAirports();
  }, [fetchBranches, fetchAirports]);

  // Stats
  const stats = useMemo(
    () => [
      {
        label: "Total Branches",
        value: branches.length,
        icon: <Building size={20} />,
        color: "blue" as const,
      },
      {
        label: "Active Branches",
        value: branches.filter((b) => b.status === "active").length,
        icon: <Activity size={20} />,
        color: "emerald" as const,
      },
      {
        label: "Avg Cars per Branch",
        value: branches.length > 0 ? (branches.length * 3) : 0,
        icon: <CalendarCheck size={20} />,
        color: "purple" as const,
      },
    ],
    [branches]
  );

  // Unique countries from branches
  const countryOptions = useMemo(() => {
    const seen = new Set<string>();
    const opts: { value: string; label: string }[] = [];
    branches.forEach((b: any) => {
      const country = (b.country || "").trim();
      if (country && !seen.has(country)) {
        seen.add(country);
        opts.push({ value: country, label: country });
      }
    });
    return opts.sort((a, b) => a.label.localeCompare(b.label));
  }, [branches]);

  // Unique addresses from branches
  const addressOptions = useMemo(() => {
    const seen = new Set<string>();
    const opts: { value: string; label: string }[] = [];
    const filtered = selectedCountry
      ? branches.filter((b: any) => (b.country || "").trim() === selectedCountry)
      : branches;
    filtered.forEach((b: any) => {
      const addr = (b.address || "").trim();
      if (addr && !seen.has(addr)) {
        seen.add(addr);
        opts.push({ value: addr, label: addr });
      }
    });
    return opts.sort((a, b) => a.label.localeCompare(b.label));
  }, [branches, selectedCountry]);

  // Search & Filter
  const filteredBranches = useMemo(() => {
    const query = (searchQuery || localSearch).toLowerCase();
    return branches.filter((b) => {
      const matchesSearch =
        b.name.toLowerCase().includes(query) ||
        b.location.toLowerCase().includes(query) ||
        b.address.toLowerCase().includes(query);
      const matchesCountry = !selectedCountry || b.country === selectedCountry;
      const matchesStatus = !selectedStatus || b.status === selectedStatus;
      const matchesAddress = !selectedAddress || b.address === selectedAddress;
      return matchesSearch && matchesCountry && matchesStatus && matchesAddress;
    });
  }, [branches, searchQuery, localSearch, selectedCountry, selectedStatus, selectedAddress]);

  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage);
  const paginatedBranches = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBranches.slice(start, start + itemsPerPage);
  }, [filteredBranches, currentPage]);

  // Add submit
  const handleAddSubmit = async () => {
    setModalError("");
    setIsSubmitting(true);
    try {
      await branchApi.create({
        name: addForm.name,
        adresse: addForm.adresse,
        location: addForm.location,
        country: addForm.country,
        city: addForm.city,
        phone: addForm.phone,
        email: addForm.email,
        currency: addForm.currency,
        activation: addForm.activation,
        location_type: addForm.location_type || 'Airport',
        abriviation: addForm.abriviation || '',
        airport_id: addForm.airport_id || null,
      });
      toast.success("Branch added successfully!");
      setIsAddModalOpen(false);
      setAddForm(defaultForm);
      fetchBranches();
    } catch (err: any) {
      setModalError(err.message || "Failed to create branch. Please try again.");
      toast.error("Failed to create branch.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Activation
  const handleToggleActivation = async (branch: Branch) => {
    const newStatus = branch.status === "active" ? "inactive" : "active";
    setBranches((prev) =>
      prev.map((b) => b.id === branch.id ? { ...b, status: newStatus } : b)
    );
    try {
      await branchApi.toggleActivation(branch.id, newStatus === "active");
      toast.success(
        newStatus === "active"
          ? `"${branch.name}" is now active.`
          : `"${branch.name}" is now inactive. Its vehicles are hidden from users.`
      );
    } catch {
      setBranches((prev) =>
        prev.map((b) => b.id === branch.id ? { ...b, status: branch.status } : b)
      );
      toast.error("Failed to update branch status.");
    }
  };

  // Delete
  const handleDelete = (id: number) => {
    toast(
      (t) => (
        <span className="flex flex-col gap-2">
          <span className="font-bold text-gray-800">Delete this branch?</span>
          <span className="text-sm text-gray-500">This action cannot be undone.</span>
          <div className="flex gap-2 mt-1">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await branchApi.delete({ id });
                  toast.success("Branch deleted successfully!");
                  fetchBranches();
                } catch (err) {
                  console.error(err);
                  toast.error("Failed to delete branch!");
                }
              }}
              className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600 transition-colors"
            >
              Yes, Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </span>
      ),
      { duration: 10000, icon: '⚠️' }
    );
  };

  return (
    <SectionLayout>
      {/* ── Add Branch Modal ── */}
      {isAddModalOpen && (
        <AddBranchModal
          formData={addForm}
          onChange={setAddForm}
          onSubmit={handleAddSubmit}
          onClose={() => { setIsAddModalOpen(false); setAddForm(defaultForm); setModalError(""); }}
          isSubmitting={isSubmitting}
          errorMsg={modalError}
          airports={allAirports}
        />
      )}

      <PageHeader
        title="Branches"
        description="Manage your physical locations and service points"
        actionLabel="Add New Branch"
        actionIcon={<Plus size={18} />}
        onAction={() => {
          setAddForm(defaultForm);
          setModalError("");
          setIsAddModalOpen(true);
        }}
      />

      <div className="mt-4">
        <StatsGrid stats={stats} />
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6 flex flex-col md:flex-row gap-4 items-stretch md:items-center">
        <div className="relative flex-1 group">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors"
            size={18}
          />
          <input
            type="text"
            placeholder="Search branches by name, location or address..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>

        <div className="w-full md:w-56">
          <SearchableDropdown
            placeholder="Filter by Country"
            value={selectedCountry}
            options={countryOptions}
            onChange={(val) => {
              setSelectedCountry(val);
              setSelectedAddress("");
            }}
            icon={Globe}
          />
        </div>

        <div className="w-full md:w-56">
          <SearchableDropdown
            placeholder="Filter by Address"
            value={selectedAddress}
            options={addressOptions}
            onChange={setSelectedAddress}
            icon={MapPin}
            disabled={addressOptions.length === 0 && !selectedCountry}
          />
        </div>

        <div className="w-full md:w-48">
          <SearchableDropdown
            placeholder="Filter by Status"
            value={selectedStatus}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            onChange={setSelectedStatus}
            icon={Activity}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-3 duration-500">
        <div className="overflow-x-auto" style={{ transform: "rotateX(180deg)" }}>
          <div style={{ transform: "rotateX(180deg)" }}>
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-8 py-5">
                    Branch Name
                  </th>
                  <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-8 py-5">
                    Country
                  </th>
                  <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-8 py-5">
                    Address
                  </th>
                  <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-8 py-5">
                    Location
                  </th>
                  <th className="text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-8 py-5">
                    Status
                  </th>
                  <th className="text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-8 py-5">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-8 py-16 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-400">
                        <Loader2 size={18} className="animate-spin" />
                        <span className="text-sm">Loading branches…</span>
                      </div>
                    </td>
                  </tr>
                ) : paginatedBranches.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-8 py-16 text-center text-gray-400 text-sm"
                    >
                      No branches found.
                    </td>
                  </tr>
                ) : (
                  paginatedBranches.map((branch) => (
                    <tr
                      key={branch.id}
                      className="hover:bg-gray-50/30 transition-all group animate-in fade-in duration-300"
                    >
                      <td className="px-8 py-5 font-black text-gray-900 group-hover:text-primary-700 transition-colors">
                        {branch.name}
                      </td>
                      <td className="px-8 py-5 text-sm font-bold text-gray-600">
                        {branch.country}
                      </td>
                      <td className="px-8 py-5 text-sm font-medium text-gray-500 max-w-xs truncate" title={branch.address}>
                        {branch.address}
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-700">
                          <div className="p-1.5 bg-primary-50 text-primary-600 rounded-lg">
                            <MapPin size={12} />
                          </div>
                          {branch.location}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex flex-col items-center gap-1.5">
                          <button
                            onClick={() => handleToggleActivation(branch)}
                            title={branch.status === "active" ? "Click to deactivate" : "Click to activate"}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full shadow-inner transition-colors duration-300 ${
                              branch.status === "active" ? "bg-emerald-500" : "bg-gray-300"
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 shadow-sm ${
                                branch.status === "active" ? "translate-x-6" : "translate-x-1"
                              }`}
                            />
                          </button>
                          <span className={`text-[10px] font-black uppercase tracking-wider ${
                            branch.status === "active" ? "text-emerald-600" : "text-gray-400"
                          }`}>
                            {branch.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex justify-end scale-90 group-hover:scale-100 transition-transform duration-200 origin-right">
                          <ActionButtons
                            onDelete={() => handleDelete(branch.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {filteredBranches.length > 0 && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 px-8 py-4 bg-gray-50/30">
            <span className="text-xs font-bold text-gray-500">
              Showing {Math.min(filteredBranches.length, (currentPage - 1) * itemsPerPage + 1)} to{" "}
              {Math.min(filteredBranches.length, currentPage * itemsPerPage)} of {filteredBranches.length} branches
            </span>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </SectionLayout>
  );
}
