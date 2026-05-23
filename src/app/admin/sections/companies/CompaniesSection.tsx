"use client";

import { useState, useMemo, useEffect } from "react";
import { Building2, ShieldCheck, CalendarCheck, X } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsCard from "@/components/ui/StatsCard";
import FilterBar from "@/components/shared/FilterBar";
import EmptyState from "@/components/ui/EmptyState";
import CompanyDetails from "./CompanyDetails";
import CompanyCard from "./CompanyCard";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/store";
import { fetchCompanies, setSelected as setSelectedCompanyAction } from "@/store/slices/companiesSlice";

const countries = ["All", "Jordan", "Kuwait", "Morocco", "United Arab Emirates", "Saudi Arabia", "Egypt", "Qatar"];
const statuses = ["All", "active", "pending", "suspended"];

const statusColorMap: Record<string, string> = {
  active: "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  suspended: "bg-red-50 text-red-700 border-red-200",
};

const statusDotMap: Record<string, string> = {
  active: "bg-emerald-500",
  pending: "bg-amber-500",
  suspended: "bg-red-500",
};

export default function CompaniesSection() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: companiesData, selected: selectedCompany, loading, error } = useSelector((state: RootState) => state.companies);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  useEffect(() => {
    if (companiesData.length === 0) dispatch(fetchCompanies());
  }, [dispatch, companiesData.length]);

  const setSelectedCompany = (company: any) => dispatch(setSelectedCompanyAction(company));

  const filteredCompanies = useMemo(() => {
    return companiesData.filter((company) => {
      const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           company.country.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           company.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = selectedCountry === "All" || company.country === selectedCountry;
      const matchesStatus = selectedStatus === "All" || company.status === selectedStatus;
      return matchesSearch && matchesCountry && matchesStatus;
    });
  }, [companiesData, searchQuery, selectedCountry, selectedStatus]);

  const clearFilters = () => { setSelectedCountry("All"); setSelectedStatus("All"); setSearchQuery(""); };

  if (selectedCompany) {
    return (
      <CompanyDetails 
        company={selectedCompany} 
        onBack={() => setSelectedCompany(null)} 
      />
    );
  }

  return (
    <SectionLayout>
      <PageHeader title="My Companies" description="Manage all registered companies" actionLabel="Add Company" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard label="Total Companies" value={companiesData.length} icon={<Building2 size={20} />} color="blue" />
        <StatsCard label="Active" value={companiesData.filter(c => c.status === "active").length} icon={<ShieldCheck size={20} />} color="emerald" />
        <StatsCard label="Pending" value={companiesData.filter(c => c.status === "pending").length} icon={<CalendarCheck size={20} />} color="amber" />
        <StatsCard label="Suspended" value={companiesData.filter(c => c.status === "suspended").length} icon={<X size={20} />} color="red" />
      </div>

      <FilterBar
        searchPlaceholder="Search companies, countries, emails..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={[
          { label: "Country", value: selectedCountry, options: countries.map(c => ({ value: c, label: c === "All" ? "All Countries" : c })), onChange: setSelectedCountry },
          { label: "Status", value: selectedStatus, options: statuses.map(s => ({ value: s, label: s === "All" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1) })), onChange: setSelectedStatus },
        ]}
        onClearFilters={clearFilters}
      />

      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-900">{filteredCompanies.length}</span> of <span className="font-semibold text-gray-900">{companiesData.length}</span> companies
        </p>
      </div>

      {filteredCompanies.length === 0 ? (
        <EmptyState onAction={clearFilters} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCompanies.map((company) => (
            <CompanyCard 
              key={company.id} 
              company={company} 
              onView={setSelectedCompany} 
              statusColorMap={statusColorMap}
              statusDotMap={statusDotMap}
            />
          ))}
        </div>
      )}
    </SectionLayout>
  );
}
