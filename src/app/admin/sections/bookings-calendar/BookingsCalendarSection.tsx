"use client";

import { useState, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Download, 
  Search,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ClipboardList,
  Filter
} from "lucide-react";
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  startOfDay,
  isBefore
} from "date-fns";

// Types
interface Booking {
  id: string;
  vehicle: string;
  category: string;
  grade: string;
  companyName: string;
  country: string;
  countryName: string;
  duration: string;
  status: string;
  type: "completed" | "pending" | "cancelled";
  date: Date;
}

// Generate Mock Data
const generateMockBookings = (): Booking[] => {
  const bookings: Booking[] = [];
  const countries = [
    { code: "SA", name: "Saudi Arabia" },
    { code: "AE", name: "UAE" },
    { code: "KW", name: "Kuwait" },
    { code: "QA", name: "Qatar" },
    { code: "EG", name: "Egypt" }
  ];
  const vehicles = ["Toyota Camry", "Hyundai Tucson", "Kia Sportage", "BMW 320i", "Mercedes C200", "Nissan Altima", "Toyota RAV4"];
  const companies = ["Al-Futtaim Motors", "Jameel Motors", "National Car Rental", "Budget Rent A Car", "Europcar"];
  const categories = ["Economy", "SUV", "Luxury", "Sedan"];
  const grades = ["Standard", "Premium", "Full Option", "Business"];
  const statuses: ("completed" | "pending" | "cancelled")[] = ["completed", "pending", "cancelled"];

  const today = new Date();
  
  for (let i = -30; i < 30; i++) {
    const date = addDays(today, i);
    const numBookings = Math.floor(Math.random() * 5) + 1;
    
    for (let j = 0; j < numBookings; j++) {
      const country = countries[Math.floor(Math.random() * countries.length)];
      const type = statuses[Math.floor(Math.random() * statuses.length)];
      bookings.push({
        id: `BK-${format(date, "yyMM")}${Math.floor(Math.random() * 9000) + 1000}`,
        vehicle: vehicles[Math.floor(Math.random() * vehicles.length)],
        category: categories[Math.floor(Math.random() * categories.length)],
        grade: grades[Math.floor(Math.random() * grades.length)],
        companyName: companies[Math.floor(Math.random() * companies.length)],
        country: country.code,
        countryName: country.name,
        duration: `${Math.floor(Math.random() * 7) + 1} Days`,
        status: type.charAt(0).toUpperCase() + type.slice(1),
        type,
        date
      });
    }
  }
  return bookings;
};

const ALL_BOOKINGS = generateMockBookings();

import { motion, AnimatePresence } from "framer-motion";

export default function BookingsCalendarSection() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [countryFilter, setCountryFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false); // For mobile toggle

  const filteredBookings = useMemo(() => {
    return ALL_BOOKINGS.filter(booking => {
      const matchesDate = isSameDay(booking.date, selectedDate);
      const matchesCountry = countryFilter === "All" || booking.countryName === countryFilter;
      const matchesStatus = statusFilter === "All" || booking.type === statusFilter.toLowerCase();
      return matchesDate && matchesCountry && matchesStatus;
    });
  }, [selectedDate, countryFilter, statusFilter]);

  const stats = useMemo(() => {
    const dayBookings = ALL_BOOKINGS.filter(b => isSameDay(b.date, selectedDate));
    return [
      { label: "Total Bookings", value: dayBookings.length, icon: ClipboardList, color: "blue" },
      { label: "Completed", value: dayBookings.filter(b => b.type === "completed").length, icon: CheckCircle2, color: "green" },
      { label: "Pending", value: dayBookings.filter(b => b.type === "pending").length, icon: AlertCircle, color: "orange" },
      { label: "Cancelled", value: dayBookings.filter(b => b.type === "cancelled").length, icon: XCircle, color: "red" },
    ];
  }, [selectedDate]);

  const countryStats = useMemo(() => {
    const dayBookings = ALL_BOOKINGS.filter(b => isSameDay(b.date, selectedDate));
    const counts: Record<string, number> = {};
    dayBookings.forEach(b => {
      counts[b.countryName] = (counts[b.countryName] || 0) + 1;
    });
    return counts;
  }, [selectedDate]);

  const statusStats = useMemo(() => {
    const dayBookings = ALL_BOOKINGS.filter(b => isSameDay(b.date, selectedDate));
    return {
      completed: dayBookings.filter(b => b.type === "completed").length,
      pending: dayBookings.filter(b => b.type === "pending").length,
      cancelled: dayBookings.filter(b => b.type === "cancelled").length,
    };
  }, [selectedDate]);

  const handleDownload = () => {
    const headers = ["Booking ID", "Vehicle", "Category", "Grade", "Company", "Country", "Duration", "Status", "Date"];
    const rows = filteredBookings.map(b => [
      b.id,
      b.vehicle,
      b.category,
      b.grade,
      b.companyName,
      b.countryName,
      b.duration,
      b.status,
      format(b.date, "yyyy-MM-dd")
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const fileName = `Bookings_Detailed_${format(selectedDate, "yyyy_MM_dd")}.csv`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const upcomingDays = useMemo(() => {
    const result = [];
    for (let i = 1; i <= 5; i++) {
      const date = addDays(new Date(), i);
      const bookings = ALL_BOOKINGS.filter(b => isSameDay(b.date, date));
      if (bookings.length > 0) {
        const saCount = bookings.filter(b => b.country === "SA").length;
        const aeCount = bookings.filter(b => b.country === "AE").length;
        const kwCount = bookings.filter(b => b.country === "KW").length;
        
        let summary = "";
        if (saCount > 0) summary += `SA ${saCount} `;
        if (aeCount > 0) summary += `AE ${aeCount} `;
        if (kwCount > 0) summary += `KW ${kwCount}`;

        result.push({
          date,
          count: bookings.length,
          summary: summary.trim() || "Local bookings"
        });
      }
    }
    return result;
  }, []);

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden pb-10">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={i} 
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm relative overflow-hidden flex flex-col items-center justify-center min-w-0"
          >
            <div className={`absolute top-0 left-0 w-full h-1 ${
              stat.color === 'blue' ? 'bg-blue-500' : 
              stat.color === 'green' ? 'bg-emerald-500' : 
              stat.color === 'orange' ? 'bg-orange-500' : 'bg-red-500'
            }`} />
            <div className="mb-2">
               <div className={`p-1.5 rounded-lg ${
                stat.color === 'blue' ? 'bg-blue-50' : 
                stat.color === 'green' ? 'bg-emerald-50' : 
                stat.color === 'orange' ? 'bg-orange-50' : 'bg-red-50'
              }`}>
                <stat.icon className={`${
                  stat.color === 'blue' ? 'text-blue-600' : 
                  stat.color === 'green' ? 'text-emerald-600' : 
                  stat.color === 'orange' ? 'text-orange-600' : 'text-red-600'
                }`} size={14} />
              </div>
            </div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1 text-center truncate w-full">{stat.label}</p>
            <p className="text-xl sm:text-2xl font-black text-gray-900 leading-none">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm min-h-[500px]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-50">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 relative">
                  <CalendarIcon className="text-gray-400" size={20} />
                  <button 
                    onClick={() => setIsCalendarOpen(true)}
                    className="lg:hidden absolute -top-1 -right-1 w-5 h-5 bg-primary text-black rounded-full flex items-center justify-center shadow-md border-2 border-white"
                  >
                    <ChevronRight size={10} />
                  </button>
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900">{format(selectedDate, "EEEE, d MMM yyyy")}</h2>
                  <p className="text-[10px] sm:text-xs text-gray-400 font-medium">
                    {filteredBookings.length} Bookings Shown
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                  className={`px-3 py-2 rounded-xl transition-all border flex items-center gap-2 font-bold text-[10px] sm:text-xs ${
                    isFiltersOpen ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <Filter size={14} />
                  <span>Filters</span>
                </button>
                <button 
                  onClick={handleDownload}
                  className="px-3 py-2 bg-primary text-black rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2 font-bold text-[10px] sm:text-xs"
                >
                  <Download size={14} />
                  <span>Export</span>
                </button>
              </div>
            </div>

            <AnimatePresence>
              {isFiltersOpen && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="bg-gray-50 rounded-xl p-4 sm:p-5 border border-gray-100 space-y-5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[10px] font-bold text-gray-900 uppercase tracking-widest">Filters</h4>
                      <button 
                        onClick={() => { setCountryFilter("All"); setStatusFilter("All"); }}
                        className="text-[10px] font-bold text-primary-700 hover:underline uppercase"
                      >
                        Reset
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-2">Country</p>
                        <div className="flex flex-wrap gap-2">
                          {["All", "Saudi Arabia", "UAE", "Kuwait", "Qatar", "Egypt"].map((name) => (
                            <button
                              key={name}
                              onClick={() => setCountryFilter(name)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                                countryFilter === name
                                  ? "bg-primary border-primary text-black shadow-sm"
                                  : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                              }`}
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-gray-400 uppercase mb-2">Status</p>
                        <div className="flex flex-wrap gap-2">
                          {["All", "Completed", "Pending", "Cancelled"].map((name) => (
                            <button
                              key={name}
                              onClick={() => setStatusFilter(name)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all border ${
                                statusFilter === name
                                  ? "bg-primary border-primary text-black shadow-sm"
                                  : "bg-white border-gray-200 text-gray-400 hover:border-gray-300"
                              }`}
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bookings List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {filteredBookings.map((booking) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={booking.id} 
                  className="bg-white border border-gray-100 rounded-xl p-5 hover:border-primary/40 transition-all relative group shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest bg-gray-50 px-2 py-1 rounded-md">{booking.id}</span>
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                      booking.type === 'completed' ? 'bg-emerald-50 text-emerald-600' :
                      booking.type === 'pending' ? 'bg-orange-50 text-orange-600' :
                      'bg-red-50 text-red-600'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-base font-black text-gray-900 leading-tight">{booking.vehicle}</h3>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50/50 px-2 py-0.5 rounded border border-gray-100 uppercase">{booking.category}</span>
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-50/50 px-2 py-0.5 rounded border border-gray-100 uppercase">{booking.grade}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-50 text-xs">
                      <div className="flex items-center gap-2 text-gray-700 font-black">
                        <MapPin size={14} className="text-primary" />
                        <span>{booking.countryName}</span>
                      </div>
                      <div className="text-gray-500 font-bold flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>{booking.duration}</span>
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 pt-1">
                       <span className="font-black text-gray-400 uppercase text-[10px] tracking-wider block mb-1">Provider</span>
                       <p className="font-bold text-gray-700">{booking.companyName}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {filteredBookings.length === 0 && (
                <div className="col-span-full py-16 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                  <p className="text-gray-400 font-bold text-xs uppercase tracking-widest">No bookings found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:col-span-4 space-y-4 sm:space-y-6">
          <CalendarSidebar 
            currentMonth={currentMonth} 
            setCurrentMonth={setCurrentMonth} 
            selectedDate={selectedDate} 
            setSelectedDate={setSelectedDate} 
            upcomingDays={upcomingDays}
          />
        </div>

        {/* Mobile/Tablet Drawer Sidebar */}
        <AnimatePresence>
          {isCalendarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsCalendarOpen(false)}
                className="lg:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-[100]"
              />
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                className="lg:hidden fixed top-0 right-0 h-full w-[80%] max-w-[350px] bg-white z-[101] shadow-xl p-6 overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-gray-900 text-sm">Navigation</h3>
                  <button onClick={() => setIsCalendarOpen(false)} className="p-1.5 bg-gray-50 rounded-lg text-gray-400">
                    <XCircle size={20} />
                  </button>
                </div>
                <CalendarSidebar 
                  currentMonth={currentMonth} 
                  setCurrentMonth={setCurrentMonth} 
                  selectedDate={selectedDate} 
                  setSelectedDate={(date: any) => { setSelectedDate(date); setIsCalendarOpen(false); }} 
                  upcomingDays={upcomingDays}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Sub-component to avoid duplication
function CalendarSidebar({ currentMonth, setCurrentMonth, selectedDate, setSelectedDate, upcomingDays }: any) {
  const today = startOfDay(new Date());

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">{format(currentMonth, "MMMM yyyy")}</h3>
          <div className="flex items-center gap-1">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400"><ChevronLeft size={16} /></button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 hover:bg-gray-50 rounded-lg text-gray-400"><ChevronRight size={16} /></button>
          </div>
        </div>
        
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
            <div key={i} className="text-[10px] font-bold text-gray-300 py-1 uppercase">{day}</div>
          ))}
        </div>
        
        <div className="space-y-1">
          {(() => {
            const monthStart = startOfMonth(currentMonth);
            const monthEnd = endOfMonth(monthStart);
            const startDate = startOfWeek(monthStart);
            const endDate = endOfWeek(monthEnd);
            const rows = [];
            let days = [];
            let day = startDate;

            while (day <= endDate) {
              for (let i = 0; i < 7; i++) {
                const cloneDay = day;
                const hasBookings = ALL_BOOKINGS.some(b => isSameDay(b.date, cloneDay));
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isPast = isBefore(startOfDay(cloneDay), today);
                const isTodayDate = isSameDay(cloneDay, today);

                days.push(
                  <button
                    key={day.toString()}
                    onClick={() => setSelectedDate(cloneDay)}
                    className={`
                      aspect-square w-full flex flex-col items-center justify-center rounded-xl transition-all relative
                      ${!isCurrentMonth ? "text-gray-100" : 
                        isSelected ? "bg-primary text-black font-bold shadow-sm" : 
                        isTodayDate ? "text-primary font-black border border-primary/20" :
                        "text-gray-700 font-medium hover:bg-gray-50"
                      }
                    `}
                  >
                    <span className="text-xs sm:text-sm">{format(day, "d")}</span>
                    {hasBookings && !isSelected && (
                      <div className={`absolute bottom-1 w-1 h-1 rounded-full ${isPast ? "bg-blue-500" : "bg-emerald-500"}`} />
                    )}
                  </button>
                );
                day = addDays(day, 1);
              }
              rows.push(<div className="grid grid-cols-7 gap-1" key={day.toString()}>{days}</div>);
              days = [];
            }
            return rows;
          })()}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <ClipboardList className="text-gray-400" size={16} />
          <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Upcoming</h3>
        </div>
        
        <div className="space-y-3">
          {upcomingDays.map((item: any, i: number) => (
            <div 
              key={i} 
              onClick={() => setSelectedDate(item.date)}
              className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-all group cursor-pointer border border-transparent hover:border-gray-50"
            >
              <div className="w-8 h-8 bg-primary/10 text-primary-700 rounded-lg flex items-center justify-center font-bold text-sm">
                {item.count}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-gray-900 truncate">{format(item.date, "EEEE, d MMM")}</h4>
                <p className="text-[9px] text-gray-400 font-medium uppercase truncate">{item.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
