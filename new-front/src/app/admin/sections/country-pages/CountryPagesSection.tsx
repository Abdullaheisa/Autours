"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Globe, Plus, Search, Eye, EyeOff, Pencil, Trash2,
  ChevronDown, ChevronUp, X, Save, Loader2,
  FileText, CheckCircle2, AlertCircle, MapPin, ExternalLink,
  Check, Filter
} from "lucide-react";
import SectionLayout from "@/components/shared/SectionLayout";
import PageHeader from "@/components/ui/PageHeader";
import StatsCard from "@/components/ui/StatsCard";
import { countryPageApi, cityPageApi } from "@/services/api";
import toast from "react-hot-toast";

/* ───────── Types ───────── */
interface Benefit { title: string; description: string; }
interface Step { title: string; description: string; }
interface Place {
  name: string;
  description: string;
  image?: string;
  tags?: string[];
  attractions?: { name: string; description: string; image: string }[];
}
interface FAQ { q: string; a: string; }

interface CityOption {
  id: number;
  name: string;
  slug: string;
  country: string;
  country_slug: string;
  is_published: boolean;
  image?: string | null;
}

interface CountryPageRecord {
  id: number;
  slug: string;
  name: string;
  code: string | null;
  hero_badge: string | null;
  hero_title: string;
  hero_highlight: string;
  hero_lead: string | null;
  hero_bottom_title: string | null;
  travel_info: { title: string; subtitle: string; image: string; benefits: Benefit[] } | null;
  steps: Step[] | null;
  documents: { items: string[] } | null;
  highlights: { title?: string; subtitle?: string; places: Place[] } | null;
  faqs: FAQ[] | null;
  selected_cities: number[] | null;
  cities?: CityOption[];
  partners_description: string | null;
  cta_title: string | null;
  cta_description: string | null;
  cta_primary_text: string | null;
  cta_secondary_text: string | null;
  meta_description: string | null;
  is_published: boolean;
  image: string | null;
  created_at?: string;
  updated_at?: string;
}

const EMPTY_FORM: Omit<CountryPageRecord, "id" | "created_at" | "updated_at"> = {
  slug: "", name: "", code: "",
  hero_badge: "", hero_title: "", hero_highlight: "", hero_lead: "", hero_bottom_title: "",
  travel_info: { title: "", subtitle: "", image: "", benefits: [] },
  steps: [
    { title: "Search", description: "Enter your airport, dates, and times to see available cars." },
    { title: "Compare", description: "Filter by price, car type, transmission, and supplier ratings." },
    { title: "Book & Drive", description: "Reserve online, pick up at the airport, and hit the road." }
  ],
  documents: { items: ["Valid driving license", "Passport or National ID", "Credit card for security deposit", "Booking confirmation"] },
  highlights: { title: "", subtitle: "", places: [] },
  faqs: [],
  selected_cities: [],
  partners_description: "",
  cta_title: "",
  cta_description: "",
  cta_primary_text: "Compare Prices",
  cta_secondary_text: "Get Expert Help",
  meta_description: "",
  is_published: true,
  image: null,
};

/* ───────── Collapsible Section ───────── */
function Section({ title, icon, children, defaultOpen = false, badge }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean; badge?: React.ReactNode }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
      <button type="button" onClick={() => setOpen(!open)} className="w-full flex items-center justify-between px-5 py-4 bg-gray-50/90 hover:bg-gray-100 transition-colors">
        <div className="flex items-center gap-2.5 font-bold text-gray-800 text-sm">
          {icon}
          <span>{title}</span>
          {badge}
        </div>
        {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {open && <div className="p-5 space-y-4 bg-white border-t border-gray-100">{children}</div>}
    </div>
  );
}

/* ───────── Input helpers ───────── */
function Input({ label, value, onChange, placeholder, required, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean; type?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all" />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <div>
      <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">{label}</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={rows}
        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all resize-y" />
    </div>
  );
}

/* ───────── Dynamic List Item ───────── */
function DynamicListItem({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="relative border border-gray-100 rounded-xl p-4 bg-gray-50/50 group">
      <button type="button" onClick={onRemove} className="absolute top-2 right-2 p-1 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100">
        <X size={14} />
      </button>
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════ MAIN SECTION ═══════════════════════════════════════ */
export default function CountryPagesSection() {
  const [countries, setCountries] = useState<CountryPageRecord[]>([]);
  const [availableCities, setAvailableCities] = useState<CityOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "form">("list");
  const [editing, setEditing] = useState<CountryPageRecord | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // City selection filter inside form
  const [citySearch, setCitySearch] = useState("");
  const [cityTab, setCityTab] = useState<"all" | "matching" | "selected">("all");

  /* ── Load Countries and Cities ── */
  const loadData = async () => {
    setLoading(true);
    try {
      const [countriesRes, citiesRes]: [any, any] = await Promise.all([
        countryPageApi.getAll(),
        cityPageApi.getAll(),
      ]);

      const countryList = countriesRes?.data?.data || countriesRes?.data || [];
      setCountries(Array.isArray(countryList) ? countryList : []);

      const cityList = citiesRes?.data?.data || citiesRes?.data || [];
      setAvailableCities(Array.isArray(cityList) ? cityList : []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load country pages or cities");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  /* ── Stats ── */
  const published = countries.filter((c) => c.is_published).length;
  const draft = countries.length - published;
  const totalCitiesLinked = countries.reduce((acc, c) => acc + (c.cities?.length || (c.selected_cities?.length ?? 0)), 0);

  /* ── Filter Countries ── */
  const filteredCountries = useMemo(() => {
    if (!search) return countries;
    const q = search.toLowerCase();
    return countries.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.slug.toLowerCase().includes(q) ||
      (c.code && c.code.toLowerCase().includes(q))
    );
  }, [countries, search]);

  /* ── Open Create ── */
  const openCreate = () => {
    setEditing(null);
    setForm(JSON.parse(JSON.stringify(EMPTY_FORM)));
    setImageFile(null);
    setCitySearch("");
    setCityTab("all");
    setView("form");
  };

  /* ── Open Edit ── */
  const openEdit = (c: CountryPageRecord) => {
    setEditing(c);

    // Initial selected cities: if c.selected_cities is array, use it; otherwise fallback to cities IDs matching country_slug
    let initialSelected: number[] = [];
    if (Array.isArray(c.selected_cities)) {
      initialSelected = c.selected_cities;
    } else if (c.cities && Array.isArray(c.cities)) {
      initialSelected = c.cities.map((ci) => ci.id);
    } else {
      // Find matching cities from available cities
      initialSelected = availableCities
        .filter((ci) => ci.country_slug === c.slug || ci.country.toLowerCase() === c.name.toLowerCase())
        .map((ci) => ci.id);
    }

    setForm({
      slug: c.slug,
      name: c.name,
      code: c.code || "",
      hero_badge: c.hero_badge || "",
      hero_title: c.hero_title || "",
      hero_highlight: c.hero_highlight || "",
      hero_lead: c.hero_lead || "",
      hero_bottom_title: c.hero_bottom_title || "",
      travel_info: c.travel_info || { title: "", subtitle: "", image: "", benefits: [] },
      steps: c.steps || [],
      documents: c.documents || { items: [] },
      highlights: c.highlights || { title: "", subtitle: "", places: [] },
      faqs: c.faqs || [],
      selected_cities: initialSelected,
      partners_description: c.partners_description || "",
      cta_title: c.cta_title || "",
      cta_description: c.cta_description || "",
      cta_primary_text: c.cta_primary_text || "Compare Prices",
      cta_secondary_text: c.cta_secondary_text || "Get Expert Help",
      meta_description: c.meta_description || "",
      is_published: c.is_published,
      image: c.image,
    });
    setImageFile(null);
    setCitySearch("");
    setCityTab("all");
    setView("form");
  };

  /* ── City Selection Helpers ── */
  const selectedCityIds = useMemo(() => {
    return form.selected_cities || [];
  }, [form.selected_cities]);

  const toggleCitySelection = (cityId: number) => {
    setForm((f) => {
      const current = f.selected_cities || [];
      const updated = current.includes(cityId)
        ? current.filter((id) => id !== cityId)
        : [...current, cityId];
      return { ...f, selected_cities: updated };
    });
  };

  const selectAllMatchingCities = () => {
    const currentSlug = form.slug.toLowerCase().trim();
    const currentName = form.name.toLowerCase().trim();
    const matchingIds = availableCities
      .filter((c) => (currentSlug && c.country_slug.toLowerCase() === currentSlug) || (currentName && c.country.toLowerCase() === currentName))
      .map((c) => c.id);

    setForm((f) => {
      const set = new Set([...(f.selected_cities || []), ...matchingIds]);
      return { ...f, selected_cities: Array.from(set) };
    });
    toast.success(`Selected matching cities for ${form.name || "this country"}`);
  };

  const selectAllCities = () => {
    setForm((f) => ({ ...f, selected_cities: availableCities.map((c) => c.id) }));
  };

  const clearAllCities = () => {
    setForm((f) => ({ ...f, selected_cities: [] }));
  };

  /* ── Filtered City Options for the selector ── */
  const filteredCityOptions = useMemo(() => {
    let list = availableCities;

    // Filter by tab
    if (cityTab === "matching") {
      const currentSlug = form.slug.toLowerCase().trim();
      const currentName = form.name.toLowerCase().trim();
      list = list.filter((c) =>
        (currentSlug && c.country_slug.toLowerCase() === currentSlug) ||
        (currentName && c.country.toLowerCase() === currentName)
      );
    } else if (cityTab === "selected") {
      list = list.filter((c) => (form.selected_cities || []).includes(c.id));
    }

    // Filter by search query
    if (citySearch.trim()) {
      const q = citySearch.toLowerCase();
      list = list.filter((c) =>
        c.name.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q)
      );
    }

    return list;
  }, [availableCities, cityTab, citySearch, form.slug, form.name, form.selected_cities]);

  /* ── Submit Country Form ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      if (form.slug) fd.append("slug", form.slug);
      if (form.code) fd.append("code", form.code);
      fd.append("hero_badge", form.hero_badge || "");
      fd.append("hero_title", form.hero_title);
      fd.append("hero_highlight", form.hero_highlight);
      fd.append("hero_lead", form.hero_lead || "");
      fd.append("hero_bottom_title", form.hero_bottom_title || "");
      fd.append("travel_info", JSON.stringify(form.travel_info));
      fd.append("steps", JSON.stringify(form.steps));
      fd.append("documents", JSON.stringify(form.documents));
      fd.append("highlights", JSON.stringify(form.highlights));
      fd.append("faqs", JSON.stringify(form.faqs));
      fd.append("selected_cities", JSON.stringify(form.selected_cities || []));
      fd.append("partners_description", form.partners_description || "");
      fd.append("cta_title", form.cta_title || "");
      fd.append("cta_description", form.cta_description || "");
      fd.append("cta_primary_text", form.cta_primary_text || "");
      fd.append("cta_secondary_text", form.cta_secondary_text || "");
      fd.append("meta_description", form.meta_description || "");
      fd.append("is_published", form.is_published ? "1" : "0");
      if (imageFile) fd.append("image", imageFile);

      if (editing) {
        await countryPageApi.update(editing.id, fd);
        toast.success("Country page updated successfully!");
      } else {
        await countryPageApi.create(fd);
        toast.success("Country page created successfully!");
      }
      setView("list");
      loadData();
    } catch (err: any) {
      const msg = err?.response?.data?.errors
        ? Object.values(err.response.data.errors).flat().join(", ")
        : err?.response?.data?.message || "Failed to save country page";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  /* ── Delete Country ── */
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this country page?")) return;
    try {
      await countryPageApi.delete(id);
      toast.success("Country page deleted!");
      loadData();
    } catch {
      toast.error("Failed to delete country page");
    }
  };

  /* ── Toggle Publish Status ── */
  const handleTogglePublish = async (id: number) => {
    try {
      await countryPageApi.togglePublish(id);
      toast.success("Publication status updated!");
      loadData();
    } catch {
      toast.error("Failed to toggle publication status");
    }
  };

  /* ── Update Nested Helpers ── */
  const updateTravelInfo = (key: string, value: any) =>
    setForm((f) => ({
      ...f,
      travel_info: {
        ...(f.travel_info || { title: "", subtitle: "", image: "", benefits: [] }),
        [key]: value,
      },
    }));

  const updateHighlights = (key: string, value: any) =>
    setForm((f) => ({
      ...f,
      highlights: {
        ...(f.highlights || { title: "", subtitle: "", places: [] }),
        [key]: value,
      },
    }));

  /* ═══════════════════════ RENDER FORM VIEW ═══════════════════════ */
  if (view === "form") {
    const matchingCount = availableCities.filter(
      (c) =>
        (form.slug && c.country_slug.toLowerCase() === form.slug.toLowerCase()) ||
        (form.name && c.country.toLowerCase() === form.name.toLowerCase())
    ).length;

    return (
      <SectionLayout>
        <div className="flex items-center justify-between pb-2 border-b border-gray-100">
          <div>
            <PageHeader
              title={editing ? `Edit Country: ${editing.name}` : "Create Country Page"}
              description="Configure country landing page details and select included cities."
              showAction={false}
            />
          </div>
          <button
            onClick={() => setView("list")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <X size={18} /> Cancel
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 mt-4">
          {/* ── Basic Info ── */}
          <Section title="Basic Information" icon={<Globe size={18} className="text-primary" />} defaultOpen>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Country Name"
                value={form.name}
                onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                placeholder="e.g. United Arab Emirates"
                required
              />
              <Input
                label="URL Slug (auto-generated if empty)"
                value={form.slug}
                onChange={(v) => setForm((f) => ({ ...f, slug: v }))}
                placeholder="e.g. uae"
              />
              <Input
                label="Country Code (optional)"
                value={form.code || ""}
                onChange={(v) => setForm((f) => ({ ...f, code: v.toUpperCase() }))}
                placeholder="e.g. AE"
              />
            </div>
            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm font-bold text-gray-800">Publish Country Page (Live on /countries/{form.slug || "..."})</span>
              </label>
            </div>
          </Section>

          {/* ── THE CORE FEATURE: INCLUDED CITIES SELECTOR ── */}
          <Section
            title="Included Cities (Showcase inside this Country)"
            icon={<MapPin size={18} className="text-emerald-500" />}
            defaultOpen
            badge={
              <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                {selectedCityIds.length} {selectedCityIds.length === 1 ? "city" : "cities"} selected
              </span>
            }
          >
            <div className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4 text-xs text-emerald-900 flex items-start gap-3">
                <MapPin size={18} className="text-emerald-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <p className="font-bold">Select which cities to include on this Country page:</p>
                  <p className="mt-0.5 text-emerald-800">
                    These cities are created from{" "}
                    <span className="font-bold underline">City Pages (/admin?tab=city-pages)</span>.
                    Any city selected below will be displayed prominently on the live country landing page (e.g.{" "}
                    <code className="bg-emerald-100/80 px-1.5 py-0.5 rounded font-mono font-bold">/countries/{form.slug || "country-slug"}</code>
                    ), allowing visitors to click directly to that city's dedicated rental page!
                  </p>
                </div>
              </div>

              {/* Controls bar: Quick actions + Filter tabs + Search */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                {/* Tabs */}
                <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setCityTab("all")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      cityTab === "all" ? "bg-white text-gray-900 shadow-sm" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    All ({availableCities.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCityTab("matching")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      cityTab === "matching" ? "bg-white text-emerald-800 shadow-sm font-black" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Matching ({matchingCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setCityTab("selected")}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      cityTab === "selected" ? "bg-white text-primary-800 shadow-sm font-black" : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Selected ({selectedCityIds.length})
                  </button>
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={selectAllMatchingCities}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                    title="Select all cities that match this country"
                  >
                    <Check size={14} /> Select Matching
                  </button>
                  <button
                    type="button"
                    onClick={selectAllCities}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={clearAllCities}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* City search input */}
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="Filter cities by name or country..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                />
              </div>

              {/* City items list */}
              {availableCities.length === 0 ? (
                <div className="text-center py-8 border border-dashed border-gray-200 rounded-xl text-gray-400 text-xs">
                  <MapPin size={24} className="mx-auto mb-2 opacity-40" />
                  <p className="font-bold">No cities created yet in City Pages</p>
                  <p className="text-gray-500 mt-1">
                    Create cities at{" "}
                    <a href="/admin?tab=city-pages" target="_blank" className="text-primary underline font-bold">
                      City Pages
                    </a>{" "}
                    first, and they will immediately appear here.
                  </p>
                </div>
              ) : filteredCityOptions.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs">
                  No cities found matching your filter criteria.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-1">
                  {filteredCityOptions.map((city) => {
                    const isSelected = selectedCityIds.includes(city.id);
                    const isMatchingCountry =
                      (form.slug && city.country_slug.toLowerCase() === form.slug.toLowerCase()) ||
                      (form.name && city.country.toLowerCase() === form.name.toLowerCase());

                    return (
                      <div
                        key={city.id}
                        onClick={() => toggleCitySelection(city.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 select-none ${
                          isSelected
                            ? "bg-emerald-50/70 border-emerald-400 shadow-sm ring-1 ring-emerald-400/40"
                            : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/60"
                        }`}
                      >
                        <div
                          className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                            isSelected
                              ? "bg-emerald-600 text-white"
                              : "border border-gray-300 bg-white"
                          }`}
                        >
                          {isSelected && <Check size={13} strokeWidth={3} />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-gray-900 text-sm truncate">{city.name}</span>
                            {isMatchingCountry && (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                                Match
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                            <span className="truncate">{city.country}</span>
                            <span>•</span>
                            <code className="text-[11px] text-gray-600 font-mono">/{city.slug}</code>
                          </div>

                          <div className="flex items-center justify-between gap-2 mt-2 pt-1.5 border-t border-gray-100">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                city.is_published
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {city.is_published ? "Published" : "Draft"}
                            </span>

                            <a
                              href={`/cities/${city.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[11px] font-bold text-primary hover:underline inline-flex items-center gap-0.5"
                            >
                              <span>View</span>
                              <ExternalLink size={10} />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </Section>

          {/* ── Hero Section ── */}
          <Section title="Hero Section" icon={<FileText size={18} className="text-blue-500" />} defaultOpen>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Hero Badge Text"
                value={form.hero_badge || ""}
                onChange={(v) => setForm((f) => ({ ...f, hero_badge: v }))}
                placeholder="e.g. Autours UAE Airport Car Rental"
              />
              <Input
                label="Hero Title"
                value={form.hero_title}
                onChange={(v) => setForm((f) => ({ ...f, hero_title: v }))}
                placeholder="e.g. Book Your Airport Rental"
                required
              />
              <Input
                label="Highlight (Colored text)"
                value={form.hero_highlight}
                onChange={(v) => setForm((f) => ({ ...f, hero_highlight: v }))}
                placeholder="e.g. Across the UAE"
                required
              />
              <Input
                label="Bottom Search Banner Text"
                value={form.hero_bottom_title || ""}
                onChange={(v) => setForm((f) => ({ ...f, hero_bottom_title: v }))}
                placeholder="e.g. Search by UAE airport and land ready to drive."
              />
            </div>
            <TextArea
              label="Hero Lead Description"
              value={form.hero_lead || ""}
              onChange={(v) => setForm((f) => ({ ...f, hero_lead: v }))}
              placeholder="e.g. Search pickup availability from all major airports across the country..."
            />
          </Section>

          {/* ── Why Autours / Travel Info ── */}
          <Section title="Why Autours (Travel Info & Benefits)" icon={<CheckCircle2 size={18} className="text-green-500" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Section Title"
                value={form.travel_info?.title || ""}
                onChange={(v) => updateTravelInfo("title", v)}
                placeholder="e.g. Why Choose Autours?"
              />
              <Input
                label="Image filename / path"
                value={form.travel_info?.image || ""}
                onChange={(v) => updateTravelInfo("image", v)}
                placeholder="e.g. countries/uae.png"
              />
            </div>
            <TextArea
              label="Subtitle / Intro"
              value={form.travel_info?.subtitle || ""}
              onChange={(v) => updateTravelInfo("subtitle", v)}
              placeholder="e.g. The Smart Way to Rent a Car Across the UAE..."
            />

            {/* Image upload */}
            <div>
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-1.5">Upload Country Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-primary/10 file:text-gray-900 hover:file:bg-primary/20 transition-all"
              />
            </div>

            {/* Benefits */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Benefits</label>
                <button
                  type="button"
                  onClick={() =>
                    updateTravelInfo("benefits", [
                      ...(form.travel_info?.benefits || []),
                      { title: "", description: "" },
                    ])
                  }
                  className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
                >
                  <Plus size={14} /> Add Benefit
                </button>
              </div>
              <div className="space-y-3">
                {(form.travel_info?.benefits || []).map((b, i) => (
                  <DynamicListItem
                    key={i}
                    onRemove={() =>
                      updateTravelInfo(
                        "benefits",
                        form.travel_info!.benefits.filter((_, idx) => idx !== i)
                      )
                    }
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <Input
                        label="Title"
                        value={b.title}
                        onChange={(v) => {
                          const bens = [...form.travel_info!.benefits];
                          bens[i] = { ...bens[i], title: v };
                          updateTravelInfo("benefits", bens);
                        }}
                      />
                      <Input
                        label="Description"
                        value={b.description}
                        onChange={(v) => {
                          const bens = [...form.travel_info!.benefits];
                          bens[i] = { ...bens[i], description: v };
                          updateTravelInfo("benefits", bens);
                        }}
                      />
                    </div>
                  </DynamicListItem>
                ))}
              </div>
            </div>
          </Section>

          {/* ── Steps ── */}
          <Section title="How It Works (Steps)" icon={<CheckCircle2 size={18} className="text-indigo-500" />}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Steps</label>
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    steps: [...(f.steps || []), { title: "", description: "" }],
                  }))
                }
                className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
              >
                <Plus size={14} /> Add Step
              </button>
            </div>
            <div className="space-y-3">
              {(form.steps || []).map((s, i) => (
                <DynamicListItem
                  key={i}
                  onRemove={() =>
                    setForm((f) => ({
                      ...f,
                      steps: f.steps!.filter((_, idx) => idx !== i),
                    }))
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      label={`Step ${i + 1} Title`}
                      value={s.title}
                      onChange={(v) => {
                        const ss = [...form.steps!];
                        ss[i] = { ...ss[i], title: v };
                        setForm((f) => ({ ...f, steps: ss }));
                      }}
                    />
                    <Input
                      label="Description"
                      value={s.description}
                      onChange={(v) => {
                        const ss = [...form.steps!];
                        ss[i] = { ...ss[i], description: v };
                        setForm((f) => ({ ...f, steps: ss }));
                      }}
                    />
                  </div>
                </DynamicListItem>
              ))}
            </div>
          </Section>

          {/* ── Documents ── */}
          <Section title="Required Documents" icon={<FileText size={18} className="text-orange-500" />}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Required Document Items</label>
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    documents: { items: [...(f.documents?.items || []), ""] },
                  }))
                }
                className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
              >
                <Plus size={14} /> Add Document
              </button>
            </div>
            <div className="space-y-2">
              {(form.documents?.items || []).map((doc, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    value={doc}
                    onChange={(e) => {
                      const items = [...form.documents!.items];
                      items[i] = e.target.value;
                      setForm((f) => ({ ...f, documents: { items } }));
                    }}
                    placeholder="e.g. Valid driving license (National or International)"
                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        documents: { items: f.documents!.items.filter((_, idx) => idx !== i) },
                      }))
                    }
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Highlights / Destinations ── */}
          <Section title="Top Destinations (Highlights)" icon={<MapPin size={18} className="text-red-500" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Section Title"
                value={form.highlights?.title || ""}
                onChange={(v) => updateHighlights("title", v)}
                placeholder="e.g. Top Destinations in the UAE"
              />
            </div>
            <TextArea
              label="Section Subtitle"
              value={form.highlights?.subtitle || ""}
              onChange={(v) => updateHighlights("subtitle", v)}
              placeholder="e.g. Explore iconic cities and landmarks..."
            />

            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Places & Landmarks</label>
              <button
                type="button"
                onClick={() =>
                  updateHighlights("places", [
                    ...(form.highlights?.places || []),
                    { name: "", description: "", image: "", tags: [] },
                  ])
                }
                className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
              >
                <Plus size={14} /> Add Place
              </button>
            </div>
            <div className="space-y-3">
              {(form.highlights?.places || []).map((p, i) => (
                <DynamicListItem
                  key={i}
                  onRemove={() =>
                    updateHighlights("places", form.highlights!.places.filter((_, idx) => idx !== i))
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      label="Place Name"
                      value={p.name}
                      onChange={(v) => {
                        const pp = [...form.highlights!.places];
                        pp[i] = { ...pp[i], name: v };
                        updateHighlights("places", pp);
                      }}
                    />
                    <Input
                      label="Image URL"
                      value={p.image || ""}
                      onChange={(v) => {
                        const pp = [...form.highlights!.places];
                        pp[i] = { ...pp[i], image: v };
                        updateHighlights("places", pp);
                      }}
                      placeholder="https://..."
                    />
                    <Input
                      label="Tags (comma-separated)"
                      value={(p.tags || []).join(", ")}
                      onChange={(v) => {
                        const pp = [...form.highlights!.places];
                        pp[i] = {
                          ...pp[i],
                          tags: v.split(",").map((t) => t.trim()).filter(Boolean),
                        };
                        updateHighlights("places", pp);
                      }}
                      placeholder="Luxury, Beaches, Culture"
                    />
                  </div>
                  <div className="mt-2">
                    <TextArea
                      label="Place Description"
                      value={p.description}
                      onChange={(v) => {
                        const pp = [...form.highlights!.places];
                        pp[i] = { ...pp[i], description: v };
                        updateHighlights("places", pp);
                      }}
                      rows={2}
                    />
                  </div>
                </DynamicListItem>
              ))}
            </div>
          </Section>

          {/* ── FAQs ── */}
          <Section title="Frequently Asked Questions" icon={<AlertCircle size={18} className="text-purple-500" />}>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider">Questions & Answers</label>
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    faqs: [...(f.faqs || []), { q: "", a: "" }],
                  }))
                }
                className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors"
              >
                <Plus size={14} /> Add FAQ
              </button>
            </div>
            <div className="space-y-3">
              {(form.faqs || []).map((faq, i) => (
                <DynamicListItem
                  key={i}
                  onRemove={() =>
                    setForm((f) => ({
                      ...f,
                      faqs: f.faqs!.filter((_, idx) => idx !== i),
                    }))
                  }
                >
                  <Input
                    label="Question"
                    value={faq.q}
                    onChange={(v) => {
                      const ff = [...form.faqs!];
                      ff[i] = { ...ff[i], q: v };
                      setForm((f) => ({ ...f, faqs: ff }));
                    }}
                  />
                  <div className="mt-2">
                    <TextArea
                      label="Answer"
                      value={faq.a}
                      onChange={(v) => {
                        const ff = [...form.faqs!];
                        ff[i] = { ...ff[i], a: v };
                        setForm((f) => ({ ...f, faqs: ff }));
                      }}
                      rows={2}
                    />
                  </div>
                </DynamicListItem>
              ))}
            </div>
          </Section>

          {/* ── CTA & Partners ── */}
          <Section title="Call To Action & Partners" icon={<Globe size={18} className="text-teal-500" />}>
            <TextArea
              label="Partners Description"
              value={form.partners_description || ""}
              onChange={(v) => setForm((f) => ({ ...f, partners_description: v }))}
              placeholder="Autours partners with leading car rental providers..."
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="CTA Title"
                value={form.cta_title || ""}
                onChange={(v) => setForm((f) => ({ ...f, cta_title: v }))}
                placeholder="e.g. Book Your Airport Car Rental in Minutes"
              />
              <Input
                label="CTA Primary Button Text"
                value={form.cta_primary_text || ""}
                onChange={(v) => setForm((f) => ({ ...f, cta_primary_text: v }))}
                placeholder="e.g. Compare Prices"
              />
            </div>
            <TextArea
              label="CTA Description"
              value={form.cta_description || ""}
              onChange={(v) => setForm((f) => ({ ...f, cta_description: v }))}
              placeholder="Unlock exclusive deals from 50+ trusted suppliers..."
            />
            <Input
              label="CTA Secondary Button Text"
              value={form.cta_secondary_text || ""}
              onChange={(v) => setForm((f) => ({ ...f, cta_secondary_text: v }))}
              placeholder="e.g. Get Expert Help"
            />
          </Section>

          {/* ── SEO ── */}
          <Section title="SEO Meta Information" icon={<Search size={18} className="text-gray-500" />}>
            <TextArea
              label="Meta Description"
              value={form.meta_description || ""}
              onChange={(v) => setForm((f) => ({ ...f, meta_description: v }))}
              placeholder="SEO meta description shown in Google search results"
            />
          </Section>

          {/* ── Bottom Submit Bar ── */}
          <div className="sticky bottom-4 z-20 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-gray-200 shadow-xl flex items-center justify-between gap-4">
            <div className="text-xs text-gray-500 font-medium">
              {selectedCityIds.length} {selectedCityIds.length === 1 ? "city" : "cities"} selected for this country
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setView("list")}
                className="px-5 py-2.5 rounded-xl font-bold text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-gray-950 px-7 py-2.5 rounded-xl font-black text-sm transition-all shadow-md shadow-primary/20 disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {editing ? "Save Changes" : "Create Country Page"}
              </button>
            </div>
          </div>
        </form>
      </SectionLayout>
    );
  }

  /* ═══════════════════════ RENDER LIST VIEW ═══════════════════════ */
  return (
    <SectionLayout>
      <PageHeader
        title="Country Pages"
        description="Manage dynamic country landing pages and select which cities to showcase inside each country."
        actionLabel="New Country Page"
        actionIcon={<Plus size={18} />}
        onAction={openCreate}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard label="Total Countries" value={countries.length} icon={<Globe size={20} />} color="blue" />
        <StatsCard label="Published" value={published} icon={<CheckCircle2 size={20} />} color="emerald" />
        <StatsCard label="Linked Cities" value={totalCitiesLinked} icon={<MapPin size={20} />} color="purple" />
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative max-w-md w-full">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search countries by name or slug..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none transition-all"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-24 text-gray-400">
          <Loader2 size={24} className="animate-spin mr-2 text-primary" /> Loading country pages...
        </div>
      ) : filteredCountries.length === 0 ? (
        <div className="text-center py-24 text-gray-400 bg-white rounded-2xl border border-gray-100">
          <Globe size={44} className="mx-auto mb-3 opacity-30 text-primary" />
          <p className="font-bold text-gray-700">No country pages found</p>
          <p className="text-sm mt-1 text-gray-500">Create your first country page to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  <th className="text-left px-5 py-3.5 font-bold text-gray-600 uppercase text-xs tracking-wider">Country</th>
                  <th className="text-left px-5 py-3.5 font-bold text-gray-600 uppercase text-xs tracking-wider">Slug</th>
                  <th className="text-left px-5 py-3.5 font-bold text-gray-600 uppercase text-xs tracking-wider">Included Cities</th>
                  <th className="text-center px-5 py-3.5 font-bold text-gray-600 uppercase text-xs tracking-wider">Status</th>
                  <th className="text-right px-5 py-3.5 font-bold text-gray-600 uppercase text-xs tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredCountries.map((c) => {
                  const cityCount = c.cities?.length ?? (c.selected_cities?.length || 0);
                  const cityNames = (c.cities || []).map((ci) => ci.name).slice(0, 3);
                  const extraCount = cityCount - cityNames.length;

                  return (
                    <tr key={c.id} className="hover:bg-gray-50/60 transition-colors">
                      {/* Country Name */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                            <Globe size={16} />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block leading-tight">{c.name}</span>
                            {c.code && (
                              <span className="text-[11px] font-mono text-gray-400 uppercase">{c.code}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Slug / Link */}
                      <td className="px-5 py-4">
                        <a
                          href={`/countries/${c.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-lg font-mono text-gray-700 transition-colors group"
                        >
                          <span>/countries/{c.slug}</span>
                          <ExternalLink size={11} className="text-gray-400 group-hover:text-gray-700" />
                        </a>
                      </td>

                      {/* Included Cities */}
                      <td className="px-5 py-4">
                        <div className="flex flex-wrap items-center gap-1.5">
                          {cityCount === 0 ? (
                            <span className="text-xs text-gray-400 italic">None selected</span>
                          ) : (
                            <>
                              {cityNames.map((cn, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                                >
                                  <MapPin size={10} />
                                  {cn}
                                </span>
                              ))}
                              {extraCount > 0 && (
                                <span className="text-xs text-gray-500 font-medium">+{extraCount} more</span>
                              )}
                            </>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => handleTogglePublish(c.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                            c.is_published
                              ? "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100"
                              : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
                          }`}
                        >
                          {c.is_published ? <Eye size={12} /> : <EyeOff size={12} />}
                          {c.is_published ? "Live" : "Draft"}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/countries/${c.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="View Public Page"
                          >
                            <ExternalLink size={15} />
                          </a>
                          <button
                            onClick={() => openEdit(c)}
                            className="p-2 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            title="Edit Country & Included Cities"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </SectionLayout>
  );
}
