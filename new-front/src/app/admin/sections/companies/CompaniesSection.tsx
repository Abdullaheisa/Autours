"use client";

import { useState, useMemo, useEffect } from "react";
import { Building2, ShieldCheck, CalendarCheck, X } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsCard from "@/components/ui/StatsCard";
import FilterBar from "@/components/shared/FilterBar";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";
import CompanyDetails from "./CompanyDetails";
import CompanyCard from "./CompanyCard";
import { companyApi } from "@/services/api";
import { getLogoUrl } from "@/utils/getImageUrl";
import toast from "react-hot-toast";

const statuses = ["All", "active", "pending", "suspended"];

const countryMap: Record<string, string> = {
  'jordan': 'Jordan',
  'kuwait': 'Kuwait',
  'morocco': 'Morocco',
  'united arab emirates': 'United Arab Emirates',
  'uae': 'United Arab Emirates',
  'u.a.e.': 'United Arab Emirates',
  'emirates': 'United Arab Emirates',
  'saudi arabia': 'Saudi Arabia',
  'saudi': 'Saudi Arabia',
  'ksa': 'Saudi Arabia',
  'k.s.a.': 'Saudi Arabia',
  'egypt': 'Egypt',
  'qatar': 'Qatar',
  'turkey': 'Turkey',
  'turkiye': 'Turkey',
  'türkiye': 'Turkey',
  'canada': 'Canada',
  'canda': 'Canada',
  'oman': 'Oman',
  'bahrain': 'Bahrain'
};

const getNormalizedCountry = (c: string | null | undefined): string => {
  if (!c) return '';
  const cleaned = c.trim().toLowerCase();
  if (countryMap[cleaned]) return countryMap[cleaned];

  // Title case capitalization for other countries
  return c.trim()
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

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

const getContextualStatus = (company: any, country: string): string => {
  if (company.status === "suspended") return "suspended";
  if (country === "All") return company.status;
  
  const countryBranches = (company.branches || []).filter(
    (b: any) => getNormalizedCountry(b.country) === country
  );
  
  if (countryBranches.length > 0) {
    const hasActiveBranch = countryBranches.some((b: any) => b.activation == 1 || b.activation === true);
    return hasActiveBranch ? "active" : "pending";
  }
  
  return company.status;
};

export default function CompaniesSection() {
  const [companiesData, setCompaniesData] = useState<any[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCountry, selectedStatus]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res: any = await companyApi.getAll();
      const rawData = Array.isArray(res) ? res : (res?.data || []);

      const mapped = rawData.map((user: any) => {
        const role = user.role || 'supplier';
        let status = 'active';
        if (role === 'under_review' || role === 'supplier') status = 'pending';
        else if (role === 'suspended' || role === 'suspended_supplier') status = 'suspended';

        const normalizedHomeCountry = getNormalizedCountry(user.country);

        const branchCountries = (user.branches || [])
          .map((b: any) => b.country)
          .filter(Boolean)
          .map((c: any) => getNormalizedCountry(c));

        const operatingCountries = branchCountries.length > 0
          ? Array.from(new Set(branchCountries))
          : (user.country ? [getNormalizedCountry(user.country)] : []);

        return {
          id: user.id,
          name: user.company || user.email || user.name || 'Unknown',
          branchName: user.name || '',
          country: normalizedHomeCountry,
          operatingCountries,
          address: user.address || user.adresse || '',
          email: user.email || '',
          phone: user.phone_num || user.phone || '',
          parentCompany: user.parent_company || user.parentCompany || null,
          role,
          vehicles: user.vehicles_count ?? user.vehicles ?? 0,
          bookings: user.rentals_count ?? user.bookings_count ?? user.bookings ?? 0,
          revenue: user.revenue ?? 0,
          rating: user.rating ?? 0,
          status,
          branches: user.branches || [],
          since: user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'N/A',
          image: getLogoUrl(user.logo),
          description: user.description,
        };
      });

      setCompaniesData(mapped);
    } catch (err: any) {
      console.error("Failed to fetch companies:", err);
      toast.error("Failed to load companies");
    } finally {
      setLoading(false);
    }
  };

  const countries = useMemo(() => {
    const list = new Set<string>();
    companiesData.forEach((company) => {
      if (company.operatingCountries) {
        company.operatingCountries.forEach((c: string) => {
          list.add(c.trim());
        });
      }
    });
    const sorted = Array.from(list)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    return ["All", ...sorted];
  }, [companiesData]);

  const { totalInCountry, activeInCountry, pendingInCountry, suspendedInCountry } = useMemo(() => {
    const list = companiesData.filter(c => selectedCountry === "All" || c.operatingCountries.includes(selectedCountry));
    const active = list.filter(c => getContextualStatus(c, selectedCountry) === "active").length;
    const pending = list.filter(c => getContextualStatus(c, selectedCountry) === "pending").length;
    const suspended = list.filter(c => getContextualStatus(c, selectedCountry) === "suspended").length;
    return {
      totalInCountry: list.length,
      activeInCountry: active,
      pendingInCountry: pending,
      suspendedInCountry: suspended
    };
  }, [companiesData, selectedCountry]);

  const filteredCompanies = useMemo(() => {
    return companiesData.filter((company) => {
      const searchLower = searchQuery.toLowerCase().trim();
      const searchNormalized = getNormalizedCountry(searchQuery).toLowerCase();

      const matchesSearch =
        company.name.toLowerCase().includes(searchLower) ||
        company.email.toLowerCase().includes(searchLower) ||
        company.operatingCountries.some((c: string) => c.toLowerCase() === searchNormalized);

      const matchesCountry = selectedCountry === "All" ||
        company.operatingCountries.includes(selectedCountry);
      
      const contextualStatus = getContextualStatus(company, selectedCountry);
      const matchesStatus = selectedStatus === "All" || contextualStatus === selectedStatus;
      
      return matchesSearch && matchesCountry && matchesStatus;
    });
  }, [companiesData, searchQuery, selectedCountry, selectedStatus]);

  const paginatedCompanies = filteredCompanies.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const clearFilters = () => { setSelectedCountry("All"); setSelectedStatus("active"); setSearchQuery(""); setCurrentPage(1); };

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
        <StatsCard label="Total Companies" value={totalInCountry} icon={<Building2 size={20} />} color="blue" />
        <StatsCard label="Active" value={activeInCountry} icon={<ShieldCheck size={20} />} color="emerald" />
        <StatsCard label="Pending" value={pendingInCountry} icon={<CalendarCheck size={20} />} color="amber" />
        <StatsCard label="Suspended" value={suspendedInCountry} icon={<X size={20} />} color="red" />
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
          Showing <span className="font-semibold text-gray-900">{paginatedCompanies.length}</span> of <span className="font-semibold text-gray-900">{filteredCompanies.length}</span> companies
        </p>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div></div>
      ) : filteredCompanies.length === 0 ? (
        <EmptyState onAction={clearFilters} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mb-6">
            {paginatedCompanies.map((company) => {
              const contextualStatus = getContextualStatus(company, selectedCountry);
              return (
                <CompanyCard
                  key={company.id}
                  company={{
                    ...company,
                    status: contextualStatus
                  }}
                  onView={setSelectedCompany}
                  statusColorMap={statusColorMap}
                  statusDotMap={statusDotMap}
                />
              );
            })}
          </div>
          <Pagination currentPage={currentPage} totalPages={Math.ceil(filteredCompanies.length / itemsPerPage)} onPageChange={setCurrentPage} />
        </>
      )}
    </SectionLayout>
  );
}
