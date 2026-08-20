"use client";

import { useState } from "react";
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { dashboardApi } from "@/services/api";
import { apiClient } from "@/services/api/axiosClient";
import CalendarRangePicker from "@/components/shared/CalendarRangePicker";
import { format } from "date-fns";
import { 
  Calendar, TrendingUp, TrendingDown, ArrowLeftRight, 
  ChevronLeft, Loader2, Sparkles, AlertCircle, Maximize2, X 
} from "lucide-react";

// Dropdowns helper for Months/Years selection
const last12Months = Array.from({ length: 12 }, (_, i) => {
  const d = new Date();
  d.setDate(1); // Prevent setMonth overflow on months with less days (e.g. Feb)
  d.setMonth(d.getMonth() - i);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return {
    value: `${year}-${month}`,
    label: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    start: `${year}-${month}-01`,
    end: `${year}-${month}-${new Date(year, d.getMonth() + 1, 0).getDate()}`
  };
});

const last5Years = Array.from({ length: 5 }, (_, i) => {
  const year = new Date().getFullYear() - i;
  return {
    value: `${year}`,
    label: `${year}`,
    start: `${year}-01-01`,
    end: `${year}-12-31`
  };
});

interface ComparisonResult {
  period1: { bookings: number; revenue: number };
  period2: { bookings: number; revenue: number };
}

interface MonthlyBookingsChartProps {
  isMaximized?: boolean;
  onMaximize?: () => void;
  onClose?: () => void;
}

export default function MonthlyBookingsChart({ isMaximized = false, onMaximize, onClose }: MonthlyBookingsChartProps) {
  const { rawData } = useSelector((state: RootState) => state.dashboard);
  
  // Continuous Trend states
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month' | 'year'>('month');
  
  // View states: 'trend' | 'compare'
  const [activeTab, setActiveTab] = useState<'trend' | 'compare'>('trend');

  // Compare mode states
  const [compareUnit, setCompareUnit] = useState<'day' | 'month' | 'year'>('month');
  
  // Select values for Month Mode
  const [month1, setMonth1] = useState(last12Months[1]?.value || "");
  const [month2, setMonth2] = useState(last12Months[0]?.value || "");

  // Select values for Year Mode
  const [year1, setYear1] = useState(last5Years[1]?.value || "");
  const [year2, setYear2] = useState(last5Years[0]?.value || "");

  // Select values for Custom Day Mode (using Date objects and custom CalendarRangePicker)
  const [p1Start, setP1Start] = useState<Date | null>(null);
  const [p1End, setP1End] = useState<Date | null>(null);
  const [p2Start, setP2Start] = useState<Date | null>(null);
  const [p2End, setP2End] = useState<Date | null>(null);
  const [showP1Calendar, setShowP1Calendar] = useState(false);
  const [showP2Calendar, setShowP2Calendar] = useState(false);

  // Loading & Results states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [compareResult, setCompareResult] = useState<ComparisonResult | null>(null);

  // Raw trend data from store
  const rawChartData = rawData?.bookingTrends?.[viewMode] || (viewMode === 'month' ? rawData?.monthlyBookings : []) || [];
  
  const trendData = rawChartData.map((item: any) => ({
    label: item.label || item.month || "",
    bookings: item.bookings || 0
  }));

  // Trend summary calculations
  const totalBookings = trendData.reduce((sum: number, item: any) => sum + (item.bookings || 0), 0);
  let trendLabel = "";
  let trendColor = "bg-gray-100 text-gray-500";

  if (totalBookings === 0) {
    trendLabel = "No data yet";
  } else {
    let part1 = 0;
    let part2 = 0;
    let periodName = "";

    if (viewMode === 'day') {
      part1 = trendData.slice(0, 15).reduce((sum: number, item: any) => sum + (item.bookings || 0), 0);
      part2 = trendData.slice(15, 30).reduce((sum: number, item: any) => sum + (item.bookings || 0), 0);
      periodName = "Last 15 Days vs Prev 15 Days";
    } else if (viewMode === 'week') {
      part1 = trendData.slice(0, 6).reduce((sum: number, item: any) => sum + (item.bookings || 0), 0);
      part2 = trendData.slice(6, 12).reduce((sum: number, item: any) => sum + (item.bookings || 0), 0);
      periodName = "Last 6 Weeks vs Prev 6 Weeks";
    } else if (viewMode === 'month') {
      part1 = trendData.slice(0, 6).reduce((sum: number, item: any) => sum + (item.bookings || 0), 0);
      part2 = trendData.slice(6, 12).reduce((sum: number, item: any) => sum + (item.bookings || 0), 0);
      periodName = "Last 6 Months vs Prev 6 Months";
    } else if (viewMode === 'year') {
      const len = trendData.length;
      if (len >= 2) {
        part1 = trendData[len - 2]?.bookings || 0;
        part2 = trendData[len - 1]?.bookings || 0;
        periodName = "Latest Year vs Previous Year";
      }
    }

    if (part1 === 0) {
      trendLabel = part2 > 0 ? "↑ Growing" : "No trend";
      trendColor = "bg-emerald-50 text-emerald-700";
    } else {
      const pct = Math.round(((part2 - part1) / part1) * 100);
      if (pct > 0) {
        trendLabel = `+${pct}% (${periodName})`;
        trendColor = "bg-emerald-50 text-emerald-700";
      } else if (pct < 0) {
        trendLabel = `${pct}% (${periodName})`;
        trendColor = "bg-red-50 text-red-600";
      } else {
        trendLabel = "Stable";
        trendColor = "bg-gray-100 text-gray-500";
      }
    }
  }

  // Handle Comparison trigger
  const handleCompare = async () => {
    let p1StartStr = "";
    let p1EndStr = "";
    let p2StartStr = "";
    let p2EndStr = "";

    if (compareUnit === 'month') {
      const m1Obj = last12Months.find(m => m.value === month1);
      const m2Obj = last12Months.find(m => m.value === month2);
      if (!m1Obj || !m2Obj) return;
      p1StartStr = m1Obj.start;
      p1EndStr = m1Obj.end;
      p2StartStr = m2Obj.start;
      p2EndStr = m2Obj.end;
    } else if (compareUnit === 'year') {
      const y1Obj = last5Years.find(y => y.value === year1);
      const y2Obj = last5Years.find(y => y.value === year2);
      if (!y1Obj || !y2Obj) return;
      p1StartStr = y1Obj.start;
      p1EndStr = y1Obj.end;
      p2StartStr = y2Obj.start;
      p2EndStr = y2Obj.end;
    } else {
      // Days mode
      if (!p1Start || !p1End || !p2Start || !p2End) {
        setError("Please select all date fields");
        return;
      }
      p1StartStr = format(p1Start, 'yyyy-MM-dd');
      p1EndStr = format(p1End, 'yyyy-MM-dd');
      p2StartStr = format(p2Start, 'yyyy-MM-dd');
      p2EndStr = format(p2End, 'yyyy-MM-dd');
    }

    setLoading(true);
    setError("");

    try {
      const response: any = await apiClient.get(
        `/api/admin/dashboard?compare=1&p1_start=${p1StartStr}&p1_end=${p1EndStr}&p2_start=${p2StartStr}&p2_end=${p2EndStr}`
      );

      console.log("Compare Response:", response);

      // Check all possible nesting structures of the response
      let compareData = null;
      if (response && typeof response === "object") {
        if (response.period1 && response.period2) {
          compareData = response;
        } else if (response.data && typeof response.data === "object") {
          if (response.data.period1 && response.data.period2) {
            compareData = response.data;
          } else if (response.data.data && typeof response.data.data === "object") {
            if (response.data.data.period1 && response.data.data.period2) {
              compareData = response.data.data;
            }
          }
        }
      }

      if (compareData) {
        setCompareResult(compareData);
      } else {
        setError("No comparison data returned from server. Check console for details.");
      }
    } catch (err) {
      console.error("Comparison Error:", err);
      setError("Failed to fetch custom comparison");
    } finally {
      setLoading(false);
    }
  };

  // Format label helper for display
  const getPeriodLabel = (periodNum: 1 | 2) => {
    if (compareUnit === 'month') {
      const mVal = periodNum === 1 ? month1 : month2;
      return last12Months.find(m => m.value === mVal)?.label || `Period ${periodNum}`;
    }
    if (compareUnit === 'year') {
      return periodNum === 1 ? year1 : year2;
    }
    const start = periodNum === 1 ? p1Start : p2Start;
    const end = periodNum === 1 ? p1End : p2End;
    if (!start || !end) return `Period ${periodNum}`;
    return `${format(start, 'dd/MM/yyyy')} to ${format(end, 'dd/MM/yyyy')}`;
  };

  // Compare Chart Data Preparation
  const getCompareChartData = () => {
    if (!compareResult) return [];
    return [
      {
        name: "Bookings",
        [getPeriodLabel(1)]: compareResult.period1.bookings,
        [getPeriodLabel(2)]: compareResult.period2.bookings,
      },
      {
        name: "Profit",
        [getPeriodLabel(1)]: compareResult.period1.revenue,
        [getPeriodLabel(2)]: compareResult.period2.revenue,
      }
    ];
  };

  // Bookings growth percentage
  const getCompareGrowth = () => {
    if (!compareResult) return null;
    const p1 = compareResult.period1.bookings;
    const p2 = compareResult.period2.bookings;
    if (p1 === 0) return p2 > 0 ? { value: 100, isUp: true } : { value: 0, isUp: true };
    const pct = Math.round(((p2 - p1) / p1) * 100);
    return {
      value: Math.abs(pct),
      isUp: pct >= 0
    };
  };

  const growth = getCompareGrowth();

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 relative ${
      isMaximized ? 'h-full w-full border-none p-0 shadow-none' : 'p-4 sm:p-5 lg:p-6 shadow-sm'
    }`}>
      
      {/* ── Tabs Navigation ── */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('trend')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'trend'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            📈 Continuous Trend
          </button>
          <button
            onClick={() => setActiveTab('compare')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'compare'
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <ArrowLeftRight size={12} /> Custom Compare
          </button>
        </div>

        <div className="flex items-center gap-2">
          {isMaximized ? (
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-colors cursor-pointer" title="Close">
              <X size={16} />
            </button>
          ) : (
            onMaximize && (
              <button onClick={onMaximize} className="p-1.5 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-colors cursor-pointer" title="Maximize">
                <Maximize2 size={16} />
              </button>
            )
          )}
        </div>
      </div>

      {/* ── VIEW 1: TRENDS CHART ── */}
      {activeTab === 'trend' && (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900">Bookings Trend</h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Booking volume over different periods</p>
            </div>

            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              {trendLabel && (
                <div className={`${trendColor} px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap`}>
                  {trendLabel}
                </div>
              )}

              <div className="flex bg-gray-100 p-1 rounded-xl gap-1 shrink-0">
                {(['day', 'week', 'month', 'year'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize ${
                      viewMode === mode
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    {mode === 'day' ? 'Days' : mode === 'week' ? 'Weeks' : mode === 'month' ? 'Months' : 'Years'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="h-[220px] sm:h-[250px] lg:h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)", padding: "12px" }} 
                  formatter={(value: number) => [value.toLocaleString(), "Bookings"]} 
                />
                <Area type="monotone" dataKey="bookings" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorBookings)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {/* ── VIEW 2: CUSTOM COMPARISON PANEL ── */}
      {activeTab === 'compare' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-1.5">
                <Sparkles size={16} className="text-blue-500 animate-pulse" /> Custom Comparison Tool
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Select and compare any two custom months, years or arbitrary days</p>
            </div>

            {/* Compare Unit switcher */}
            <div className="flex bg-gray-100 p-1 rounded-xl gap-1 shrink-0 self-start md:self-auto">
              {(['day', 'month', 'year'] as const).map((unit) => (
                <button
                  key={unit}
                  onClick={() => {
                    setCompareUnit(unit);
                    setCompareResult(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize ${
                    compareUnit === unit
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {unit === 'day' ? 'Custom Days' : unit === 'month' ? 'Months' : 'Years'}
                </button>
              ))}
            </div>
          </div>

          {/* Form Selection Area */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
            {/* Period 1 selection */}
            <div className="md:col-span-5 space-y-2">
              <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Base Period (Period 1)</span>
              
              {compareUnit === 'month' && (
                <select
                  value={month1}
                  onChange={(e) => setMonth1(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-700 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {last12Months.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              )}

              {compareUnit === 'year' && (
                <select
                  value={year1}
                  onChange={(e) => setYear1(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-700 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {last5Years.map((y) => (
                    <option key={y.value} value={y.value}>{y.label}</option>
                  ))}
                </select>
              )}

              {compareUnit === 'day' && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowP1Calendar(!showP1Calendar);
                      setShowP2Calendar(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-left shadow-xs transition-all outline-none hover:bg-gray-50 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <Calendar size={15} className="text-gray-400 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[8px] font-black uppercase tracking-wider text-gray-400">Date Range</span>
                      <span className="text-xs font-bold text-gray-800 truncate">
                        {p1Start && p1End 
                          ? `${format(p1Start, 'dd/MM/yyyy')} - ${format(p1End, 'dd/MM/yyyy')}`
                          : 'Select Dates'
                        }
                      </span>
                    </div>
                  </button>
                  {showP1Calendar && (
                    <div className="absolute top-full left-0 mt-2 z-50">
                      <CalendarRangePicker
                        startDate={p1Start}
                        endDate={p1End}
                        allowPastDates={true}
                        singleMonth={true}
                        onSelect={(start, end) => {
                          setP1Start(start);
                          setP1End(end);
                        }}
                        onClose={() => setShowP1Calendar(false)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Separator / vs icon */}
            <div className="md:col-span-2 flex items-center justify-center">
              <span className="bg-white border border-gray-200 text-gray-400 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-xs">
                VS
              </span>
            </div>

            {/* Period 2 selection */}
            <div className="md:col-span-5 space-y-2">
              <span className="text-[10px] font-bold uppercase text-gray-400 tracking-wider">Comparison Period (Period 2)</span>
              
              {compareUnit === 'month' && (
                <select
                  value={month2}
                  onChange={(e) => setMonth2(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-700 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {last12Months.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              )}

              {compareUnit === 'year' && (
                <select
                  value={year2}
                  onChange={(e) => setYear2(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-xs text-gray-700 shadow-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {last5Years.map((y) => (
                    <option key={y.value} value={y.value}>{y.label}</option>
                  ))}
                </select>
              )}

              {compareUnit === 'day' && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setShowP2Calendar(!showP2Calendar);
                      setShowP1Calendar(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 bg-white border border-gray-200 rounded-xl text-left shadow-xs transition-all outline-none hover:bg-gray-50 focus:ring-2 focus:ring-blue-500/20"
                  >
                    <Calendar size={15} className="text-gray-400 shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-[8px] font-black uppercase tracking-wider text-gray-400">Date Range</span>
                      <span className="text-xs font-bold text-gray-800 truncate">
                        {p2Start && p2End 
                          ? `${format(p2Start, 'dd/MM/yyyy')} - ${format(p2End, 'dd/MM/yyyy')}`
                          : 'Select Dates'
                        }
                      </span>
                    </div>
                  </button>
                  {showP2Calendar && (
                    <div className="absolute top-full left-0 mt-2 z-50">
                      <CalendarRangePicker
                        startDate={p2Start}
                        endDate={p2End}
                        allowPastDates={true}
                        singleMonth={true}
                        onSelect={(start, end) => {
                          setP2Start(start);
                          setP2End(end);
                        }}
                        onClose={() => setShowP2Calendar(false)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="md:col-span-12 bg-red-50 text-red-600 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5">
                <AlertCircle size={14} /> {error}
              </div>
            )}

            {/* Submit Button */}
            <div className="md:col-span-12 flex justify-end">
              <button
                onClick={handleCompare}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Fetching...
                  </>
                ) : (
                  <>
                    <ArrowLeftRight size={14} /> Run Comparison
                  </>
                )}
              </button>
            </div>
          </div>

          {/* ── Results rendering ── */}
          {compareResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 animate-in fade-in duration-300">
              
              {/* Left Column: Big Growth Badge & Details */}
              <div className="lg:col-span-4 flex flex-col justify-center items-center p-5 border border-gray-100 rounded-2xl bg-gray-50/50 text-center gap-3">
                <div className={`p-4 rounded-full ${growth?.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {growth?.isUp ? <TrendingUp size={36} /> : <TrendingDown size={36} />}
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-gray-900">
                    {growth ? `${growth.isUp ? '+' : '-'}${growth.value}%` : "0%"}
                  </p>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mt-1">Bookings Growth</p>
                </div>
                <div className="border-t border-gray-200/60 w-full my-2" />
                <div className="w-full text-left space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 font-medium">Period 1 Bookings:</span>
                    <span className="text-gray-900 font-bold">{compareResult.period1.bookings}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 font-medium">Period 2 Bookings:</span>
                    <span className="text-gray-900 font-bold">{compareResult.period2.bookings}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 font-medium">Period 1 Profit:</span>
                    <span className="text-gray-900 font-bold">${compareResult.period1.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400 font-medium">Period 2 Profit:</span>
                    <span className="text-gray-900 font-bold">${compareResult.period2.revenue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Comparison Bar Chart */}
              <div className="lg:col-span-8 h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getCompareChartData()} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 11 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#fff", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }} 
                    />
                    <Legend iconSize={8} iconType="circle" />
                    <Bar dataKey={getPeriodLabel(1)} fill="#93c5fd" radius={[4, 4, 0, 0]} />
                    <Bar dataKey={getPeriodLabel(2)} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
