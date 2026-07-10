"use client";

import { useState, useMemo, useEffect } from "react";
import { Users, Phone, MapPin, Star, Calendar, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsCard from "@/components/ui/StatsCard";
import FilterBar from "@/components/shared/FilterBar";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";

import { customerApi } from "@/services/api";
import toast from "react-hot-toast";

export default function CustomersSection() {
  const [customersData, setCustomersData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [isLoading, setIsLoading] = useState(true);

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
    'bahrain': 'Bahrain',
    'oman': 'Oman',
    'turkey': 'Turkey',
    'turkiye': 'Turkey',
    'türkiye': 'Turkey',
    'canada': 'Canada',
    'canda': 'Canada'
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

  const countries = useMemo(() => {
    const list = new Set<string>();
    customersData.forEach((customer) => {
      if (customer.country) {
        list.add(getNormalizedCountry(customer.country));
      }
    });
    const sorted = Array.from(list)
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
    return ["All", ...sorted];
  }, [customersData]);

  const loadCustomers = () => {
    setIsLoading(true);
    customerApi.getAll()
      .then((res: any) => {
        const list = Array.isArray(res) ? res : (res?.data || []);
        setCustomersData(list);
      })
      .catch((err) => console.warn(err.message))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    return customersData.filter((customer) => {
      const name = customer.name || customer.first_name || "";
      const email = customer.email || "";
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) || email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = selectedCountry === "All" || getNormalizedCountry(customer.country) === selectedCountry;
      return matchesSearch && matchesCountry;
    });
  }, [customersData, searchQuery, selectedCountry]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const clearFilters = () => { setSearchQuery(""); setSelectedCountry("All"); setCurrentPage(1); };

  const handleDelete = (id: number) => {
    toast(
      (t) => (
        <span className="flex flex-col gap-2">
          <span className="font-bold text-gray-800">Delete this customer?</span>
          <span className="text-sm text-gray-500">This action cannot be undone.</span>
          <div className="flex gap-2 mt-1">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  await customerApi.delete({ id });
                  toast.success("Customer deleted successfully!");
                  loadCustomers();
                } catch (err) {
                  console.error(err);
                  toast.error("Failed to delete customer!");
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

  const stats = useMemo(() => {
    const total = customersData.length;
    const active = customersData.filter(c => {
      const rentalsCount = c.rentals_count || c.rentals?.length || 0;
      return rentalsCount > 0 || c.status === 'active' || c.email_verified_at;
    }).length;
    
    // Average rating
    const ratings = customersData.map(c => parseFloat(c.rating || c.rate || 0)).filter(r => !isNaN(r) && r > 0);
    const avg = ratings.length > 0 ? (ratings.reduce((sum, r) => sum + r, 0) / ratings.length).toFixed(1) : "0.0";

    // Total Bookings
    const bookings = customersData.reduce((sum, c) => sum + (parseInt(c.rentals_count || c.rentals?.length || 0) || 0), 0);

    return { total, active, avg, bookings };
  }, [customersData]);

  return (

    <SectionLayout>
      <PageHeader title="Customers" description="Manage customer accounts and profiles" actionLabel="Add Customer" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard label="Total Customers" value={stats.total} icon={<Users size={20} />} color="blue" />
        <StatsCard label="Active" value={stats.active} icon={<CheckCircle2 size={20} />} color="emerald" />
        <StatsCard label="Avg Rating" value={stats.avg} icon={<Star size={20} />} color="amber" />
        <StatsCard label="Total Bookings" value={stats.bookings} icon={<Calendar size={20} />} color="purple" />
      </div>
      <FilterBar
        searchPlaceholder="Search customers..."
        searchValue={searchQuery}
        onSearchChange={setSearchQuery}
        filters={[{ label: "Country", value: selectedCountry, options: countries.map(c => ({ value: c, label: c === "All" ? "All Countries" : c })), onChange: setSelectedCountry }]}
        onClearFilters={clearFilters}
      />
      {filteredCustomers.length === 0 ? (
        <EmptyState onAction={clearFilters} />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedCustomers.map((customer) => (
              <div key={customer.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-lg hover:border-primary-200 transition-all duration-300">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center shrink-0">
                    <span className="text-lg font-bold text-primary-700">{(customer.name || customer.first_name || "?").charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{customer.name || customer.first_name || "Unknown"}</h3>
                    <p className="text-xs text-gray-500">{customer.email || "No Email"}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600"><Phone size={12} className="text-gray-400" />{customer.phone_num || customer.phone || "N/A"}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-600"><MapPin size={12} className="text-gray-400" />{customer.formatted_address || customer.address || customer.city || "Unknown"}</div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1"><Calendar size={12} className="text-gray-400" /><span className="text-xs text-gray-500">{customer.rentals_count || customer.rentals?.length || 0} bookings</span></div>
                  <div className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" /><span className="text-xs font-medium text-gray-900">{customer.rating || customer.rate || 0}</span></div>
                </div>
                <div className="mt-3 flex justify-end">
                  <button 
                    onClick={() => handleDelete(customer.id)}
                    className="text-xs text-red-500 hover:text-red-700 font-medium px-2 py-1 bg-red-50 hover:bg-red-100 rounded transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </>
      )}
    </SectionLayout>
  );
}
