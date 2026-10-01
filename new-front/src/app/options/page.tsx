"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Plus,
  Minus,
  HelpCircle,
  Car,
  SlidersHorizontal,
  Layers,
  Search,
  Zap,
  Info,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  UserCheck,
  Navigation,
  Baby,
  Briefcase,
  Check,
  Clock,
  Wifi,
  Tag,
  Snowflake,
  Shield,
} from "lucide-react";
import { RootState, AppDispatch } from "@/store";
import { fetchVehicles, restoreSearchSession } from "@/store/slices/searchSlice";
import type { Vehicle, Currency } from "@/types";
import { extrasPricingApi } from "@/services/api";
import { getVehicleDisplayPrice } from "@/utils/vehiclePrice";
import { convertExtraPrice, ExtraItem } from "@/app/booking/components/BookingExtras";
import Navbar from "@/components/shared/layout/Navbar";
import Footer from "@/components/shared/layout/Footer";
import Stepper from "@/app/search/components/Stepper";
import CarCard from "@/app/search/components/CarCard";
import SearchSummary from "@/app/search/components/SearchSummary";
import BookingChecklist from "@/app/booking/components/BookingChecklist";
import ExtraFaqModal from "./components/ExtraFaqModal";

const SUPPORTED_BACKEND_CURRENCIES = [
  "USD", "EUR", "GBP", "EGP", "SAR", "AED", "QAR", "OMR", "KWD", "BHD",
  "JOD", "MAD", "TRY", "GEL", "CHF", "CAD", "AUD", "SEK", "NOK", "DKK", "PLN"
];

function getExtraConfig(name: string, key?: string) {
  const lower = (name + " " + (key || "")).toLowerCase();
  if (lower.includes("driver")) {
    return {
      icon: <UserCheck className="w-5 h-5" />,
      colorClass: "bg-blue-50 text-blue-600 border border-blue-150",
      selectedClass: "bg-primary text-gray-950 border-primary",
      defaultBadge: "Popular",
    };
  }
  if (lower.includes("gps") || lower.includes("navigation") || lower.includes("map")) {
    return {
      icon: <Navigation className="w-5 h-5" />,
      colorClass: "bg-sky-50 text-sky-600 border border-sky-150",
      selectedClass: "bg-primary text-gray-950 border-primary",
      defaultBadge: "Recommended",
    };
  }
  if (
    lower.includes("seat") ||
    lower.includes("infant") ||
    lower.includes("booster") ||
    lower.includes("child") ||
    lower.includes("baby") ||
    lower.includes("toddler")
  ) {
    return {
      icon: <Baby className="w-5 h-5" />,
      colorClass: "bg-amber-50 text-amber-700 border border-amber-200",
      selectedClass: "bg-primary text-gray-950 border-primary",
      defaultBadge: "Family Favorite",
    };
  }
  if (lower.includes("wifi") || lower.includes("internet")) {
    return {
      icon: <Wifi className="w-5 h-5" />,
      colorClass: "bg-purple-50 text-purple-600 border border-purple-150",
      selectedClass: "bg-primary text-gray-950 border-primary",
      defaultBadge: "Convenient",
    };
  }
  return {
    icon: <Briefcase className="w-5 h-5" />,
    colorClass: "bg-emerald-50 text-emerald-700 border border-emerald-150",
    selectedClass: "bg-primary text-gray-950 border-primary",
    defaultBadge: null,
  };
}

function OptionsContent() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const searchParams = useSearchParams();

  const vehicleId = searchParams.get("vehicleId");
  const bookId = searchParams.get("bookId");

  const { vehicles, searchParams: searchStateParams, daysNumber, fetchedCurrency } = useSelector(
    (state: RootState) => state.search
  );
  const { code: currencyCode, allRates } = useSelector((state: RootState) => state.currency);

  // ── Selected Vehicle state & Session Restoration ──
  const [restoredVehicle, setRestoredVehicle] = useState<Vehicle | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("autours_selected_vehicle");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return null;
  });

  const [lockedVehicle, setLockedVehicle] = useState<Vehicle | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("autours_selected_vehicle");
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return null;
  });
  const hasLockedRef = useRef(false);

  // Restore search session and parameters if page is reloaded
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedParamsStr = sessionStorage.getItem("autours_search_params");
        const savedVehicleStr = sessionStorage.getItem("autours_selected_vehicle");
        const savedDays = sessionStorage.getItem("autours_days_number");
        const savedCurr = sessionStorage.getItem("autours_fetched_currency");

        const parsedParams = savedParamsStr ? JSON.parse(savedParamsStr) : null;
        const parsedVehicle = savedVehicleStr ? JSON.parse(savedVehicleStr) : null;
        const parsedDays = savedDays ? parseInt(savedDays, 10) : undefined;

        if (parsedVehicle && !lockedVehicle) {
          setLockedVehicle(parsedVehicle);
          hasLockedRef.current = true;
        }

        if ((!searchStateParams.location || !vehicles.length) && (parsedParams || parsedVehicle)) {
          dispatch(
            restoreSearchSession({
              searchParams: parsedParams || undefined,
              daysNumber: parsedDays || undefined,
              vehicles: parsedVehicle ? [parsedVehicle] : undefined,
              fetchedCurrency: savedCurr || undefined,
            })
          );
        }
      } catch (e) {
        console.error("Failed to restore search session in options:", e);
      }
    }
  }, [dispatch]);

  useEffect(() => {
    if (!vehicles.length) {
      if (!lockedVehicle && restoredVehicle) {
        setLockedVehicle(restoredVehicle);
        hasLockedRef.current = true;
      }
      return;
    }

    if (!hasLockedRef.current) {
      let found: Vehicle | null = null;

      if (vehicleId) {
        found = vehicles.find((v: Vehicle) => v.id.toString() === vehicleId) || null;
      }
      if (!found && bookId) {
        found = vehicles.find((v: Vehicle) => v.id.toString() === bookId) || null;
      }
      if (!found) {
        for (const v of vehicles) {
          const bvIds = (v as any).branch_vehicle_ids;
          if (!bvIds || typeof bvIds !== "object") continue;
          const vals = Object.values(bvIds).map((id: any) => String(id));
          if ((vehicleId && vals.includes(vehicleId)) || (bookId && vals.includes(bookId))) {
            found = v;
            break;
          }
        }
      }
      if (!found && (vehicleId || bookId)) return;
      if (!found) found = vehicles[0];

      if (found) {
        hasLockedRef.current = true;
        setLockedVehicle(found);
      }
    } else {
      const lockedId = lockedVehicle?.id;
      const lockedName = lockedVehicle?.name;
      const lockedSupplierId = lockedVehicle?.supplier?.id;
      if (lockedName) {
        const updated = vehicles.find(
          (v: Vehicle) =>
            (lockedId && v.id === lockedId) ||
            (v.name === lockedName && v.supplier?.id === lockedSupplierId)
        );
        if (updated && updated.id !== lockedVehicle?.id) {
          setLockedVehicle(updated);
        }
      }
    }
  }, [vehicles, vehicleId, bookId, lockedVehicle, restoredVehicle]);

  const selectedVehicle =
    lockedVehicle ||
    (vehicleId ? vehicles.find((v) => v.id.toString() === vehicleId) : null) ||
    vehicles[0] ||
    restoredVehicle ||
    null;

  // Persist selected vehicle and current search params to sessionStorage whenever they change
  useEffect(() => {
    if (selectedVehicle && typeof window !== "undefined") {
      try {
        sessionStorage.setItem("autours_selected_vehicle", JSON.stringify(selectedVehicle));
        if (searchStateParams?.location) {
          sessionStorage.setItem("autours_search_params", JSON.stringify(searchStateParams));
        }
        if (daysNumber) {
          sessionStorage.setItem("autours_days_number", String(daysNumber));
        }
        if (fetchedCurrency) {
          sessionStorage.setItem("autours_fetched_currency", fetchedCurrency);
        }
      } catch (e) {}
    }
  }, [selectedVehicle, searchStateParams, daysNumber, fetchedCurrency]);
  const actualVehicleToBook = bookId || selectedVehicle?.id?.toString() || vehicleId || "";

  // ── Extras List & Selected State ──
  const [extrasList, setExtrasList] = useState<ExtraItem[]>([]);
  const [isLoadingExtras, setIsLoadingExtras] = useState(true);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>(() => {
    if (typeof window !== "undefined") {
      try {
        const urlParam = searchParams.get("extras");
        if (urlParam) {
          return JSON.parse(decodeURIComponent(urlParam));
        }
        const saved = sessionStorage.getItem("autours_selected_extras");
        if (saved) {
          return JSON.parse(saved);
        }
      } catch {
        return {};
      }
    }
    return {};
  });

  const [selectedFaqExtra, setSelectedFaqExtra] = useState<ExtraItem | null>(null);
  const [showAllExtras, setShowAllExtras] = useState(false);

  // Progressive disclosure: show 2 extras by default unless expanded
  const visibleExtras = useMemo(() => {
    if (showAllExtras || extrasList.length <= 2) {
      return extrasList;
    }
    return extrasList.slice(0, 2);
  }, [showAllExtras, extrasList]);

  // Auto-expand if the user has selected an extra that is outside the first 2
  useEffect(() => {
    if (extrasList.length > 2 && !showAllExtras) {
      const hasSelectedBeyond = extrasList.slice(2).some((extra) => {
        const extraId = extra.key || extra.id;
        return (selectedExtras[extraId] || 0) > 0;
      });
      if (hasSelectedBeyond) {
        setShowAllExtras(true);
      }
    }
  }, [extrasList, selectedExtras, showAllExtras]);

  // Fetch customized real extras based on branch, country, company, and vehicle
  useEffect(() => {
    if (!selectedVehicle && !vehicleId && !actualVehicleToBook) return;

    const supplierId =
      selectedVehicle?.supplier?.id ||
      (selectedVehicle as any)?.supplier_id ||
      (typeof (selectedVehicle as any)?.supplier === "number"
        ? (selectedVehicle as any).supplier
        : undefined);

    const availableBranches = (selectedVehicle as any)?.available_branches || [];
    const branchVehicleIds = (selectedVehicle as any)?.branch_vehicle_ids || {};
    let resolvedBranchId: number | string | undefined = undefined;

    if (actualVehicleToBook && Object.keys(branchVehicleIds).length > 0) {
      const match = Object.entries(branchVehicleIds).find(
        ([_, vId]) => String(vId) === String(actualVehicleToBook)
      );
      if (match) resolvedBranchId = Number(match[0]);
    }
    if (!resolvedBranchId) {
      resolvedBranchId =
        (selectedVehicle as any)?.branch?.id ||
        (selectedVehicle as any)?.pickup_loc ||
        (selectedVehicle as any)?.branch_id ||
        availableBranches[0]?.id;
    }

    const country =
      (selectedVehicle as any)?.branch?.country ||
      availableBranches[0]?.country ||
      (searchStateParams as any)?.country;

    const currentVehicleId = selectedVehicle?.id || vehicleId || undefined;

    setIsLoadingExtras(true);
    extrasPricingApi
      .getPricing({
        supplier_id: supplierId,
        branch_id: resolvedBranchId,
        country: country,
        vehicle_id: currentVehicleId ?? undefined,
      })
      .then((res: any) => {
        const items = Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res)
          ? res
          : [];
        setExtrasList(items);
      })
      .catch(() => {
        setExtrasList([]);
      })
      .finally(() => {
        setIsLoadingExtras(false);
      });
  }, [selectedVehicle, actualVehicleToBook, vehicleId, (searchStateParams as any)?.country]);

  // Clean up any selected extras that are no longer offered by the company/branch
  useEffect(() => {
    if (!isLoadingExtras && extrasList.length >= 0) {
      const validKeys = new Set(extrasList.map((e) => e.key || e.id));
      setSelectedExtras((prev) => {
        let hasInvalid = false;
        const cleaned: Record<string, number> = {};
        for (const [key, qty] of Object.entries(prev)) {
          if (validKeys.has(key) && qty > 0) {
            cleaned[key] = qty;
          } else {
            hasInvalid = true;
          }
        }
        return hasInvalid ? cleaned : prev;
      });
    }
  }, [extrasList, isLoadingExtras]);

  // Keep sessionStorage in sync
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem("autours_selected_extras", JSON.stringify(selectedExtras));
      } catch {}
    }
  }, [selectedExtras]);

  // Compute reliable rental days (never 0)
  const rentalDays = useMemo(() => {
    if (daysNumber && daysNumber > 0) return daysNumber;
    if (searchStateParams?.dateFrom && searchStateParams?.dateTo) {
      const start = new Date(searchStateParams.dateFrom).getTime();
      const end = new Date(searchStateParams.dateTo).getTime();
      const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (diff > 0) return diff;
    }
    if (typeof window !== "undefined") {
      try {
        const savedParams = sessionStorage.getItem("autours_search_params");
        if (savedParams) {
          const parsed = JSON.parse(savedParams);
          if (parsed.dateFrom && parsed.dateTo) {
            const start = new Date(parsed.dateFrom).getTime();
            const end = new Date(parsed.dateTo).getTime();
            const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            if (diff > 0) return diff;
          }
        }
      } catch {}
    }
    return 1;
  }, [daysNumber, searchStateParams]);

  // ── Price calculations ──
  const baseVehiclePrice = selectedVehicle
    ? getVehicleDisplayPrice(
        selectedVehicle,
        currencyCode as Currency,
        allRates,
        rentalDays,
        fetchedCurrency
      )
    : 0;
  const dailyPrice = Math.round(baseVehiclePrice / rentalDays);

  const extrasTotalPriceRaw = extrasList.reduce((acc, extra) => {
    const extraId = extra.key || extra.id;
    const qty = selectedExtras[extraId] || 0;
    if (qty > 0) {
      const basePrice = extra.price !== undefined ? extra.price : (extra.price_usd || 0);
      const baseCurrency = extra.currency || "USD";
      const unitPrice = convertExtraPrice(basePrice, baseCurrency, currencyCode, allRates);
      return acc + unitPrice * qty;
    }
    return acc;
  }, 0);
  const extrasTotalPrice = Math.round(extrasTotalPriceRaw * 100) / 100;
  const grandTotalPrice = Math.round((baseVehiclePrice + extrasTotalPrice) * 100) / 100;

  const selectedExtrasCount = Object.values(selectedExtras).filter((q) => q > 0).length;

  // ── Extra change handler ──
  const handleExtraChange = (id: string, qty: number) => {
    setSelectedExtras((prev) => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[id];
      } else {
        next[id] = qty;
      }
      return next;
    });
  };

  // ── Navigation to Booking ──
  const handleProceedToBooking = () => {
    if (typeof window !== "undefined") {
      try {
        if (selectedVehicle) {
          sessionStorage.setItem("autours_selected_vehicle", JSON.stringify(selectedVehicle));
        }
        sessionStorage.setItem("autours_selected_extras", JSON.stringify(selectedExtras));
      } catch (e) {}
    }
    const extrasQuery = encodeURIComponent(JSON.stringify(selectedExtras));
    const targetUrl = `/booking?vehicleId=${vehicleId || selectedVehicle?.id}&bookId=${actualVehicleToBook}&extras=${extrasQuery}`;
    router.push(targetUrl);
  };

  return (
    <div className="pb-16">
      {/* ── Native 4-Step Stepper Bar ── */}
      <Stepper
        currentStep={3}
        vehicleId={vehicleId || selectedVehicle?.id}
        bookId={actualVehicleToBook}
      />

      <div className="max-w-[1400px] xl:max-w-[90rem] 2xl:max-w-[95rem] mx-auto px-4 py-6">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 transition-colors group cursor-pointer"
          >
            <div className="w-7 h-7 rounded-lg bg-gray-100 group-hover:bg-primary group-hover:text-gray-900 flex items-center justify-center transition-colors">
              <ArrowLeft size={14} />
            </div>
            <span>Back to Search Results</span>
          </Link>
        </div>

        {/* Mobile Search Summary + Car Card */}
        <div className="lg:hidden mb-6 space-y-4">
          <SearchSummary hideEditButton={true} forceMobileLayout={true} />
          {selectedVehicle && (
            <CarCard
              vehicle={selectedVehicle}
              daysNumber={daysNumber}
              hideBookingControls={true}
              preselectedBookId={actualVehicleToBook}
            />
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* ── LEFT SIDEBAR: Trip Details & Price Summary ────────────────────────── */}
          <aside className="w-full lg:w-[340px] shrink-0 space-y-5 max-w-3xl lg:max-w-none mx-auto lg:mx-0">
            <div className="hidden lg:block">
              <SearchSummary hideEditButton={true} />
            </div>

            {/* Price Summary Card */}
            <div className="bg-white rounded-3xl border-2 border-primary overflow-hidden shadow-sm">
              <div className="bg-primary/10 px-5 py-3.5 border-b border-primary/20 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-black uppercase tracking-widest text-gray-600">
                    Your Trip Summary
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">Live Price Breakdown</p>
                </div>
                {selectedExtrasCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black">
                    +{selectedExtrasCount} Extras
                  </span>
                )}
              </div>

              <div className="p-5 space-y-4">
                {/* Total Price */}
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-gray-900 tracking-tight">
                      {grandTotalPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-xl font-black text-gray-600">{currencyCode}</span>
                  </div>
                  <p className="text-xs text-emerald-700 font-bold mt-1 flex items-center gap-1.5">
                    <CheckCircle2 size={13} className="shrink-0" />
                    Includes VAT &amp; standard insurance for {rentalDays}{" "}
                    {rentalDays === 1 ? "day" : "days"}
                  </p>
                </div>

                {/* Breakdown */}
                <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Daily Rate</span>
                    <span className="text-gray-900 font-bold">
                      {dailyPrice.toLocaleString()} {currencyCode}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 font-medium">
                    <span>Base Vehicle Rental</span>
                    <span className="text-gray-900 font-bold">
                      {baseVehiclePrice.toLocaleString()} {currencyCode}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-600 font-medium pt-1">
                    <span className="flex items-center gap-1">
                      <span>Optional Extras</span>
                      {selectedExtrasCount > 0 && (
                        <span className="px-1.5 py-0.2 bg-blue-100 text-blue-800 text-[10px] font-black rounded-full">
                          {selectedExtrasCount}
                        </span>
                      )}
                    </span>
                    <span
                      className={
                        extrasTotalPrice > 0
                          ? "text-blue-700 font-black text-xs"
                          : "text-gray-900 font-bold text-xs"
                      }
                    >
                      {extrasTotalPrice > 0
                        ? `+${extrasTotalPrice.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}`
                        : "0.00"}{" "}
                      {currencyCode}
                    </span>
                  </div>

                  {/* Itemized Extras List in Sidebar */}
                  {selectedExtrasCount > 0 && (
                    <div className="p-2.5 bg-gray-50/80 rounded-2xl space-y-1.5 border border-gray-100 animate-in fade-in duration-150">
                      {extrasList.map((ex) => {
                        const extraId = ex.key || ex.id;
                        const qty = selectedExtras[extraId] || 0;
                        if (qty <= 0) return null;
                        const basePrice = ex.price !== undefined ? ex.price : (ex.price_usd || 0);
                        const baseCurrency = ex.currency || "USD";
                        const itemTotal =
                          convertExtraPrice(basePrice, baseCurrency, currencyCode, allRates) * qty;
                        return (
                          <div
                            key={extraId}
                            className="flex items-center justify-between text-[11px] text-gray-700 gap-2"
                          >
                            <span className="truncate">
                              • {ex.name} {qty > 1 ? `(x${qty})` : ""}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="font-bold text-gray-900">
                                {itemTotal.toFixed(2)} {currencyCode}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleExtraChange(extraId, 0)}
                                className="text-gray-400 hover:text-red-600 p-0.5 transition-colors cursor-pointer"
                                title="Remove"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="h-px bg-gray-200 my-2" />

                  <div className="flex justify-between items-baseline font-black text-gray-900 pt-1">
                    <span className="text-sm">Grand Total</span>
                    <span className="text-lg text-primary-700">
                      {grandTotalPrice.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      {currencyCode}
                    </span>
                  </div>
                </div>

                {/* Primary CTA Button */}
                <button
                  type="button"
                  onClick={handleProceedToBooking}
                  className="w-full py-3.5 px-4 bg-primary text-gray-900 font-black text-sm uppercase rounded-2xl hover:bg-primary-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <span>Continue to Booking</span>
                  <ArrowRight size={16} />
                </button>

                {/* Skip Secondary Link */}
                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={handleProceedToBooking}
                    className="text-xs text-gray-500 hover:text-gray-900 font-bold underline transition-colors cursor-pointer"
                  >
                    Skip add-ons &amp; continue directly
                  </button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="px-5 py-2.5 bg-gray-50/80 border-t border-gray-100 flex items-center justify-center text-[11.5px] text-gray-500">
                <span className="flex items-center gap-1.5 font-bold text-emerald-700">
                  <ShieldCheck size={14} /> Free Cancellation Included
                </span>
              </div>
            </div>
          </aside>

          {/* ── RIGHT MAIN CONTENT: Car Card & Extras Selection ─────────────────── */}
          <div className="flex-1 min-w-0 space-y-6 w-full max-w-3xl lg:max-w-none mx-auto lg:mx-0">
            {/* Desktop Car Card (Exact preservation of design & details) */}
            <div className="hidden lg:block">
              {selectedVehicle ? (
                <CarCard
                  vehicle={selectedVehicle}
                  daysNumber={rentalDays}
                  hideBookingControls={true}
                  preselectedBookId={actualVehicleToBook}
                />
              ) : (
                <div className="p-8 bg-white rounded-2xl border border-gray-100 text-center text-gray-500">
                  Loading vehicle details...
                </div>
              )}
            </div>

            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-6 rounded-full bg-primary inline-block shrink-0" />
                  <h3 className="text-lg sm:text-xl font-black text-gray-950 tracking-tight">
                    Rental Add-ons &amp; Extras
                  </h3>
                </div>
                <p className="text-xs text-gray-500 pl-4.5">
                  Official optional equipment and services offered by{" "}
                  <span className="font-bold text-gray-800">
                    {selectedVehicle?.supplier?.name || "the rental company"}
                  </span>
                  {(selectedVehicle as any)?.branch?.name ? ` at ${(selectedVehicle as any).branch.name}` : ""}
                </p>
              </div>

              {!isLoadingExtras && extrasList.length > 0 && (
                <div className="flex items-center gap-2 pl-4.5 sm:pl-0">
                  <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-bold border border-gray-200 shadow-2xs">
                    {extrasList.length > 2 && !showAllExtras
                      ? `Showing 2 of ${extrasList.length} options`
                      : `${extrasList.length} ${extrasList.length === 1 ? "option" : "options"} available`}
                  </span>
                  {selectedExtrasCount > 0 && (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black border border-emerald-200 flex items-center gap-1 shadow-2xs animate-in fade-in duration-150">
                      <Check size={12} className="stroke-[3]" /> {selectedExtrasCount} selected
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* ── Extras Grid / Cards ─────────────────────────────────────────── */}
            <div className="space-y-4">
              {isLoadingExtras ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="bg-white rounded-2xl md:rounded-3xl border border-gray-200 p-5 sm:p-6 space-y-4 animate-pulse shadow-2xs"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-gray-200" />
                          <div className="space-y-1.5">
                            <div className="w-36 h-4 bg-gray-200 rounded-md" />
                            <div className="w-24 h-3 bg-gray-150 rounded" />
                          </div>
                        </div>
                        <div className="w-24 h-7 bg-gray-200 rounded-xl" />
                      </div>
                      <div className="w-4/5 h-3 bg-gray-100 rounded" />
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                        <div className="w-28 h-5 bg-gray-200 rounded" />
                        <div className="w-28 h-10 bg-gray-200 rounded-2xl" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : extrasList.length === 0 ? (
                <div className="p-8 sm:p-12 bg-white rounded-3xl border border-dashed border-gray-250 text-center space-y-4 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100 shadow-sm">
                    <Sparkles className="w-7 h-7" />
                  </div>
                  <div className="max-w-md mx-auto space-y-1.5">
                    <h4 className="text-base sm:text-lg font-black text-gray-900">
                      All Standard Equipment Included
                    </h4>
                    <p className="text-xs sm:text-[13px] text-gray-500 leading-relaxed">
                      The rental company ({selectedVehicle?.supplier?.name || "supplier"}) includes all required standard equipment with this vehicle. No optional add-ons are required.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleProceedToBooking}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-gray-950 font-black text-xs uppercase tracking-wider rounded-2xl hover:bg-primary-600 active:scale-95 transition-all shadow-md cursor-pointer"
                  >
                    <span>Continue to Booking</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              ) : (
                visibleExtras.map((extra) => {
                  const extraId = extra.key || extra.id;
                  const qty = selectedExtras[extraId] || 0;
                  const isSelected = qty > 0;
                  const extraConfig = getExtraConfig(extra.name, extraId);

                  const basePrice = extra.price !== undefined ? extra.price : (extra.price_usd || 0);
                  const baseCurrency = extra.currency || "USD";

                  const displayUnitPrice = convertExtraPrice(
                    basePrice,
                    baseCurrency,
                    currencyCode,
                    allRates
                  );
                  const displayTotalPrice = displayUnitPrice * (qty > 0 ? qty : 1);

                  return (
                    <div
                      key={extraId}
                      className={`group relative bg-white rounded-2xl md:rounded-3xl border transition-all duration-200 overflow-hidden ${
                        isSelected
                          ? "border-primary ring-2 ring-primary/25 shadow-md bg-amber-50/15"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-md shadow-xs"
                      }`}
                    >
                      {/* Card Top Accent Line when selected */}
                      {isSelected && (
                        <div className="h-1 bg-gradient-to-r from-primary via-amber-400 to-primary w-full" />
                      )}

                      <div className="p-4 sm:p-5 md:p-6 space-y-4">
                        {/* Header row: Icon + Title + Badges + Info Help button */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 sm:gap-3.5 min-w-0">
                            <div
                              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-2xs ${
                                isSelected ? extraConfig.selectedClass : extraConfig.colorClass
                              }`}
                            >
                              {extraConfig.icon}
                            </div>

                            <div className="min-w-0 pt-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h4 className="text-base sm:text-lg font-bold text-gray-950 tracking-tight">
                                  {extra.name}
                                </h4>
                                {(extra.badge || extraConfig.defaultBadge) && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100/80 text-amber-900 border border-amber-200/60 shadow-2xs shrink-0 flex items-center gap-1">
                                    <Sparkles size={11} className="text-amber-600" />
                                    {extra.badge || extraConfig.defaultBadge}
                                  </span>
                                )}
                                {isSelected && (
                                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200/80 flex items-center gap-1 shrink-0 animate-in zoom-in-95 duration-150">
                                    <Check size={12} className="stroke-[3]" /> Added
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 font-medium">
                                <span className="inline-flex items-center gap-1">
                                  <Clock size={12} className="text-gray-400" />
                                  {extra.type === "quantity"
                                    ? `Quantity option (up to ${extra.max_qty || 3})`
                                    : "Flat rate for entire trip"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Info Icon Button (Opens FAQ Modal) */}
                          <button
                            type="button"
                            onClick={() => setSelectedFaqExtra(extra)}
                            className="w-8 h-8 rounded-full text-gray-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all cursor-pointer shrink-0"
                            title={`Questions & details about ${extra.name}`}
                            aria-label={`Questions & details about ${extra.name}`}
                          >
                            <HelpCircle size={18} className="stroke-[2]" />
                          </button>
                        </div>

                        {/* Description text */}
                        <p className="text-xs sm:text-[13.5px] text-gray-600 leading-relaxed max-w-2xl">
                          {extra.description || "Optional add-on service provided for your vehicle rental."}
                        </p>

                        {/* Footer Row: Pricing & Action Controls */}
                        <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          {/* Price block */}
                          <div>
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-2xl sm:text-[26px] font-black text-gray-950 font-sans tracking-tight">
                                {currencyCode}{" "}
                                {displayTotalPrice.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                              {qty > 1 && (
                                <span className="text-xs text-gray-400 font-bold">
                                  ({displayUnitPrice.toFixed(2)} {currencyCode} × {qty})
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 font-medium block">
                              total for entire rental ({rentalDays} {rentalDays === 1 ? "day" : "days"})
                            </span>
                          </div>

                          {/* Action button / quantity stepper */}
                          <div className="flex items-center justify-end">
                            {extra.type === "quantity" ? (
                              isSelected ? (
                                <div className="flex items-center gap-1.5 bg-gray-100/90 border border-gray-200/90 rounded-2xl p-1 shadow-inner">
                                  <button
                                    type="button"
                                    onClick={() => handleExtraChange(extraId, Math.max(0, qty - 1))}
                                    className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center justify-center active:scale-90 transition-all shadow-2xs cursor-pointer"
                                    title="Decrease quantity"
                                  >
                                    <Minus size={14} strokeWidth={2.5} />
                                  </button>
                                  <span className="w-8 text-center text-sm font-black text-gray-950 font-sans select-none">
                                    {qty}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleExtraChange(extraId, Math.min(extra.max_qty || 3, qty + 1))
                                    }
                                    disabled={qty >= (extra.max_qty || 3)}
                                    className="w-9 h-9 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-primary hover:text-gray-950 hover:border-primary flex items-center justify-center active:scale-90 transition-all disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-700 shadow-2xs cursor-pointer"
                                    title="Increase quantity"
                                  >
                                    <Plus size={14} strokeWidth={2.5} />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleExtraChange(extraId, 1)}
                                  className="min-w-[120px] px-6 py-3 rounded-2xl bg-primary text-gray-950 font-black text-xs uppercase tracking-wider hover:bg-primary-600 hover:shadow-md active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Plus size={15} strokeWidth={2.5} />
                                  <span>Add</span>
                                </button>
                              )
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleExtraChange(extraId, isSelected ? 0 : 1)}
                                className={`min-w-[120px] px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                                  isSelected
                                    ? "bg-gray-950 text-white hover:bg-red-600 hover:border-red-600 border border-gray-950 group"
                                    : "bg-primary text-gray-950 hover:bg-primary-600 hover:shadow-md"
                                }`}
                              >
                                {isSelected ? (
                                  <>
                                    <Check size={15} strokeWidth={3} className="group-hover:hidden" />
                                    <X size={15} strokeWidth={3} className="hidden group-hover:inline" />
                                    <span className="group-hover:hidden">Added</span>
                                    <span className="hidden group-hover:inline">Remove</span>
                                  </>
                                ) : (
                                  <>
                                    <Plus size={15} strokeWidth={2.5} />
                                    <span>Add</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}

              {/* View More / Show Fewer Add-ons Button */}
              {!isLoadingExtras && extrasList.length > 2 && (
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAllExtras((prev) => !prev)}
                    className="w-full py-3.5 px-5 bg-white hover:bg-gray-50 border-2 border-dashed border-gray-250 hover:border-gray-400 rounded-2xl md:rounded-3xl font-black text-xs sm:text-sm text-gray-800 transition-all flex items-center justify-center gap-2 shadow-2xs group cursor-pointer"
                  >
                    {showAllExtras ? (
                      <>
                        <ChevronUp size={16} className="text-gray-500 group-hover:-translate-y-0.5 transition-transform" />
                        <span>Show fewer options</span>
                      </>
                    ) : (
                      <>
                        <ChevronDown size={16} className="text-gray-500 group-hover:translate-y-0.5 transition-transform" />
                        <span>View more add-ons (+{extrasList.length - 2} more available)</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Checklist Before Pick-up */}
            <div className="pt-2">
              <BookingChecklist
                pickupTime={searchStateParams.startTime || "10:00"}
                depositAmount={selectedVehicle?.deposit}
                currencyCode={currencyCode}
              />
            </div>

            {/* Bottom Next Step Bar */}
            <div className="p-6 bg-white rounded-3xl border border-gray-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-black text-gray-900">Ready to book your car?</h4>
                <p className="text-xs text-gray-500 mt-0.5">
                  You can review everything and enter driver details in the final checkout step.
                </p>
              </div>
              <button
                type="button"
                onClick={handleProceedToBooking}
                className="w-full sm:w-auto px-8 py-3.5 bg-primary text-gray-900 font-black text-sm uppercase rounded-2xl hover:bg-primary-600 active:scale-95 transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue to Booking</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Sticky Bottom Bar ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 p-4 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">
              Total ({rentalDays} {rentalDays === 1 ? "day" : "days"})
            </div>
            <div className="text-xl font-black text-gray-900">
              {grandTotalPrice.toLocaleString(undefined, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
              })}{" "}
              <span className="text-xs text-gray-500">{currencyCode}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleProceedToBooking}
            className="flex-1 max-w-[200px] py-3 px-4 bg-primary text-gray-900 font-black text-xs uppercase rounded-xl hover:bg-primary-600 active:scale-95 transition-all text-center shadow-md flex items-center justify-center gap-1.5"
          >
            <span>Continue</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Extra FAQ Modal Dialog */}
      <ExtraFaqModal
        isOpen={Boolean(selectedFaqExtra)}
        onClose={() => setSelectedFaqExtra(null)}
        title={selectedFaqExtra?.name || "Optional Extra"}
        description={selectedFaqExtra?.description || ""}
        faqs={selectedFaqExtra?.faqs}
      />
    </div>
  );
}

export default function OptionsPage() {
  return (
    <main className="min-h-screen bg-[#fcfcfc]">
      <Navbar />
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-bold text-gray-500">Loading trip options...</p>
            </div>
          </div>
        }
      >
        <OptionsContent />
      </Suspense>
      <Footer />
    </main>
  );
}
