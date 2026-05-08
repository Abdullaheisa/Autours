"use client";

import { useState, useMemo } from "react";
import { Users, Phone, MapPin, Star, Calendar, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import StatsCard from "@/components/ui/StatsCard";
import FilterBar from "@/components/shared/FilterBar";
import EmptyState from "@/components/ui/EmptyState";
import Pagination from "@/components/ui/Pagination";

const customersData = [
  { id: 1, name: "Ahmed Hassan", email: "ahmed@example.com", phone: "+971 50 123 4567", country: "UAE", city: "Dubai", bookings: 12, rating: 4.8, joined: "2024-01-15" },
  { id: 2, name: "Mohammed Ali", email: "mohammed@example.com", phone: "+966 50 234 5678", country: "Saudi", city: "Riyadh", bookings: 8, rating: 4.5, joined: "2024-02-20" },
  { id: 3, name: "Sara Khalid", email: "sara@example.com", phone: "+20 10 345 6789", country: "Egypt", city: "Cairo", bookings: 15, rating: 4.9, joined: "2023-11-10" },
  { id: 4, name: "Omar Fahd", email: "omar@example.com", phone: "+974 50 456 7890", country: "Qatar", city: "Doha", bookings: 5, rating: 4.2, joined: "2024-03-05" },
  { id: 5, name: "Fatima Zahra", email: "fatima@example.com", phone: "+965 50 567 8901", country: "Kuwait", city: "Kuwait City", bookings: 20, rating: 5.0, joined: "2023-09-15" },
  { id: 6, name: "Youssef Amr", email: "youssef@example.com", phone: "+973 50 678 9012", country: "Bahrain", city: "Manama", bookings: 3, rating: 4.0, joined: "2024-04-01" },
];

const countries = ["All", "UAE", "Saudi", "Egypt", "Qatar", "Kuwait", "Bahrain"];

export default function CustomersSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const filteredCustomers = useMemo(() => {
    return customersData.filter((customer) => {
      const matchesSearch = customer.name.toLowerCase().includes(searchQuery.toLowerCase()) || customer.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCountry = selectedCountry === "All" || customer.country === selectedCountry;
      return matchesSearch && matchesCountry;
    });
  }, [searchQuery, selectedCountry]);

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const clearFilters = () => { setSearchQuery(""); setSelectedCountry("All"); setCurrentPage(1); };

  return (

    <SectionLayout>
      <PageHeader title="Customers" description="Manage customer accounts and profiles" actionLabel="Add Customer" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatsCard label="Total Customers" value={customersData.length} icon={<Users size={20} />} color="blue" />
        <StatsCard label="Active" value={5} icon={<CheckCircle2 size={20} />} color="emerald" />
        <StatsCard label="Avg Rating" value="4.6" icon={<Star size={20} />} color="amber" />
        <StatsCard label="Total Bookings" value={63} icon={<Calendar size={20} />} color="purple" />
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
                    <span className="text-lg font-bold text-primary-700">{customer.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-gray-900 truncate">{customer.name}</h3>
                    <p className="text-xs text-gray-500">{customer.email}</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-600"><Phone size={12} className="text-gray-400" />{customer.phone}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-600"><MapPin size={12} className="text-gray-400" />{customer.city}, {customer.country}</div>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1"><Calendar size={12} className="text-gray-400" /><span className="text-xs text-gray-500">{customer.bookings} bookings</span></div>
                  <div className="flex items-center gap-1"><Star size={12} className="text-amber-400 fill-amber-400" /><span className="text-xs font-medium text-gray-900">{customer.rating}</span></div>
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
