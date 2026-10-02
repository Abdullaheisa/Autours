"use client";

import React, { useState, useEffect, useMemo, useCallback, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Star,
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
import PickupDropoffCard from "./components/PickupDropoffCard";
import PriceBreakdownCard from "@/app/booking/components/PriceBreakdownCard";
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
        if (
          updated &&
          (updated.id !== lockedVehicle?.id ||
            updated.final_price !== lockedVehicle?.final_price ||
            updated.price_currency !== lockedVehicle?.price_currency)
        ) {
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
        const vehicleToSave = {
          ...selectedVehicle,
          price_currency: selectedVehicle.price_currency || fetchedCurrency || 'EGP',
        };
        sessionStorage.setItem("autours_selected_vehicle", JSON.stringify(vehicleToSave));
        if (searchStateParams?.location) {
          sessionStorage.setItem("autours_search_params", JSON.stringify(searchStateParams));
        }
        if (daysNumber) {
          sessionStorage.setItem("autours_days_number", String(daysNumber));
        }
        if (vehicleToSave.price_currency || fetchedCurrency) {
          sessionStorage.setItem("autours_fetched_currency", vehicleToSave.price_currency || fetchedCurrency || 'EGP');
        }
      } catch (e) {}
    }
  }, [selectedVehicle, searchStateParams, daysNumber, fetchedCurrency]);
  const actualVehicleToBook = bookId || selectedVehicle?.id?.toString() || vehicleId || "";

  // ── Extras List & Selected State ──
  const [extrasList, setExtrasList] = useState<ExtraItem[]>([]);
  const [isLoadingExtras, setIsLoadingExtras] = useState(true);
  const [extrasLoaded, setExtrasLoaded] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>(() => {
    if (typeof window !== "undefined") {
      try {
        const currentCarId = vehicleId || bookId;
        const savedCarId = sessionStorage.getItem("autours_extras_vehicle_id");

        const urlParam = searchParams.get("extras");
        if (urlParam) {
          const parsed = JSON.parse(decodeURIComponent(urlParam));
          if (currentCarId) {
            sessionStorage.setItem("autours_extras_vehicle_id", String(currentCarId));
            sessionStorage.setItem("autours_selected_extras", JSON.stringify(parsed));
          }
          return parsed;
        }

        // If saved vehicle ID does not match current vehicle, reset to {}
        if (savedCarId && currentCarId && String(savedCarId) !== String(currentCarId)) {
          sessionStorage.removeItem("autours_selected_extras");
          sessionStorage.removeItem("autours_extras_vehicle_id");
          return {};
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

  // Reset extras if selected vehicle ID differs from saved vehicle ID
  useEffect(() => {
    if (typeof window !== "undefined" && selectedVehicle?.id) {
      try {
        const savedCarId = sessionStorage.getItem("autours_extras_vehicle_id");
        if (savedCarId && String(savedCarId) !== String(selectedVehicle.id)) {
          sessionStorage.removeItem("autours_selected_extras");
          sessionStorage.removeItem("autours_extras_vehicle_id");
          setSelectedExtras({});
        }
      } catch {}
    }
  }, [selectedVehicle?.id]);

  const [selectedFaqExtra, setSelectedFaqExtra] = useState<ExtraItem | null>(null);
  const [showAllExtras, setShowAllExtras] = useState(false);
  const [expandedExtras, setExpandedExtras] = useState<Record<string, boolean>>({});
  const userManuallyToggledExtrasRef = useRef(false);
  const initialAutoExpandedRef = useRef(false);

  useEffect(() => {
    initialAutoExpandedRef.current = false;
    userManuallyToggledExtrasRef.current = false;
  }, [selectedVehicle?.id]);

  const toggleExtraExpand = (extraId: string) => {
    setExpandedExtras((prev) => ({
      ...prev,
      [extraId]: !prev[extraId],
    }));
  };

  // Progressive disclosure: show 2 extras by default unless expanded
  const visibleExtras = useMemo(() => {
    if (showAllExtras || extrasList.length <= 2) {
      return extrasList;
    }
    return extrasList.slice(0, 2);
  }, [showAllExtras, extrasList]);

  // Auto-expand ONCE on initial load if the user already has a pre-selected extra outside the first 2
  useEffect(() => {
    if (userManuallyToggledExtrasRef.current) return;
    if (initialAutoExpandedRef.current) return;

    if (extrasList.length > 2 && !showAllExtras) {
      const hasSelectedBeyond = extrasList.slice(2).some((extra) => {
        const extraId = extra.key || extra.id;
        return (selectedExtras[extraId] || 0) > 0;
      });
      if (hasSelectedBeyond) {
        initialAutoExpandedRef.current = true;
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
        setExtrasLoaded(true);
      });
  }, [selectedVehicle, actualVehicleToBook, vehicleId, (searchStateParams as any)?.country]);

  // Auto-redirect to booking if vehicle has no extras configured
  useEffect(() => {
    if ((selectedVehicle as any)?.has_extras === false) {
      const targetUrl = `/booking?vehicleId=${vehicleId || selectedVehicle?.id}&bookId=${actualVehicleToBook}`;
      router.replace(targetUrl);
    }
  }, [selectedVehicle, vehicleId, actualVehicleToBook, router]);

  // Auto-redirect to booking if extras query returned 0 available extras
  useEffect(() => {
    if (extrasLoaded && !isLoadingExtras && extrasList.length === 0 && (selectedVehicle || vehicleId)) {
      const targetUrl = `/booking?vehicleId=${vehicleId || selectedVehicle?.id}&bookId=${actualVehicleToBook}`;
      router.replace(targetUrl);
    }
  }, [extrasLoaded, isLoadingExtras, extrasList.length, selectedVehicle, vehicleId, actualVehicleToBook, router]);

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

  const itemizedExtras = useMemo(() => {
    return extrasList
      .filter((ex) => (selectedExtras[ex.key || ex.id] || 0) > 0)
      .map((ex) => {
        const qty = selectedExtras[ex.key || ex.id];
        const basePrice = ex.price !== undefined ? ex.price : (ex.price_usd || 0);
        const baseCurrency = ex.currency || "USD";
        const itemTotal = convertExtraPrice(basePrice, baseCurrency, currencyCode, allRates) * qty;
        return {
          id: ex.key || ex.id,
          name: ex.name,
          qty,
          totalPrice: itemTotal,
        };
      });
  }, [extrasList, selectedExtras, currencyCode, allRates]);

  // ── Extra change handler ──
  const handleExtraChange = (id: string, qty: number) => {
    setSelectedExtras((prev) => {
      const next = { ...prev };
      if (qty <= 0) {
        delete next[id];
      } else {
        next[id] = qty;
      }
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem("autours_selected_extras", JSON.stringify(next));
          const currentCarId = selectedVehicle?.id || actualVehicleToBook || vehicleId;
          if (currentCarId) {
            sessionStorage.setItem("autours_extras_vehicle_id", String(currentCarId));
          }
        } catch (e) {}
      }
      return next;
    });
  };

  // ── Navigation to Booking ──
  const handleProceedToBooking = () => {
    if (typeof window !== "undefined") {
      try {
        if (selectedVehicle) {
          const vehicleToSave = {
            ...selectedVehicle,
            price_currency: selectedVehicle.price_currency || fetchedCurrency || 'EGP',
          };
          sessionStorage.setItem("autours_selected_vehicle", JSON.stringify(vehicleToSave));
          sessionStorage.setItem("autours_fetched_currency", vehicleToSave.price_currency);
        }
        sessionStorage.setItem("autours_selected_extras", JSON.stringify(selectedExtras));
        const currentCarId = selectedVehicle?.id || actualVehicleToBook || vehicleId;
        if (currentCarId) {
          sessionStorage.setItem("autours_extras_vehicle_id", String(currentCarId));
        }
        if (extrasList.length > 0) {
          sessionStorage.setItem("autours_available_extras", JSON.stringify(extrasList));
        }
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

      <div className="max-w-[1400px] xl:max-w-[90rem] 2xl:max-w-[95rem] mx-auto px-4 py-8">
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

        {/* Mobile Pickup/Dropoff + Car Card */}
        <div className="lg:hidden mb-6 space-y-4">
          {selectedVehicle && (
            <CarCard
              vehicle={selectedVehicle}
              daysNumber={daysNumber}
              hideBookingControls={true}
              preselectedBookId={actualVehicleToBook}
            />
          )}
          {/* 1. Pick-up and Drop-off Card First */}
          <PickupDropoffCard
            pickupDate={searchStateParams.dateFrom}
            pickupTime={searchStateParams.startTime || "10:00"}
            dropoffDate={searchStateParams.dateTo}
            dropoffTime={searchStateParams.endTime || "10:00"}
            pickupBranch={(selectedVehicle as any)?.branch}
            dropoffBranch={(selectedVehicle as any)?.branch}
            fallbackLocation={searchStateParams.locationLabel || searchStateParams.location || "Selected Location"}
            supplierName={selectedVehicle?.supplier?.name}
          />
          {/* 2. Price Breakdown / Invoice Card Underneath */}
          <PriceBreakdownCard
            rentalDays={rentalDays}
            currencyCode={currencyCode}
            baseVehiclePrice={baseVehiclePrice}
            extrasItems={itemizedExtras}
            grandTotalPrice={grandTotalPrice}
            onRemoveExtra={(id) => handleExtraChange(String(id), 0)}
          />
        </div>

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ── LEFT SIDEBAR: Matches Search Page Width Identically ────────────────────────── */}
          <aside className="w-full lg:w-[250px] xl:w-[280px] 2xl:w-[320px] shrink-0 space-y-4">
            {/* 1. Pick-up and Drop-off Card First */}
            <PickupDropoffCard
              pickupDate={searchStateParams.dateFrom}
              pickupTime={searchStateParams.startTime || "10:00"}
              dropoffDate={searchStateParams.dateTo}
              dropoffTime={searchStateParams.endTime || "10:00"}
              pickupBranch={(selectedVehicle as any)?.branch}
              dropoffBranch={(selectedVehicle as any)?.branch}
              fallbackLocation={searchStateParams.locationLabel || searchStateParams.location || "Selected Location"}
              supplierName={selectedVehicle?.supplier?.name}
            />

            {/* 2. Price Breakdown / Invoice Card Underneath */}
            <PriceBreakdownCard
              rentalDays={rentalDays}
              currencyCode={currencyCode}
              baseVehiclePrice={baseVehiclePrice}
              extrasItems={itemizedExtras}
              grandTotalPrice={grandTotalPrice}
              onRemoveExtra={(id) => handleExtraChange(String(id), 0)}
            />
          </aside>

          {/* ── RIGHT MAIN CONTENT: Exactly matches Search Page Width ─────────────────── */}
          <div className="flex-1 w-full min-w-0 space-y-4">
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
            {(isLoadingExtras || extrasList.length > 0) && (
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
            )}

            {/* ── Extras Grid / Cards ─────────────────────────────────────────── */}
            {(isLoadingExtras || extrasList.length > 0) && (
              <div className="space-y-2">
                {isLoadingExtras ? (
                  <div className="space-y-2">
                    {[1, 2].map((i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl border border-gray-200 px-4 py-2.5 space-y-2.5 animate-pulse shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8.5 h-8.5 rounded-lg bg-gray-200" />
                            <div className="space-y-1">
                              <div className="w-32 h-3.5 bg-gray-200 rounded-md" />
                              <div className="w-20 h-2.5 bg-gray-150 rounded" />
                            </div>
                          </div>
                          <div className="w-20 h-6 bg-gray-200 rounded-lg" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  visibleExtras.map((extra) => {
                    const extraId = extra.key || extra.id;
                    const qty = selectedExtras[extraId] || 0;
                    const isSelected = qty > 0;
                    const isExpanded = Boolean(expandedExtras[extraId]);
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
                        className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                          isSelected
                            ? "border-primary ring-2 ring-primary/25 shadow-sm bg-amber-50/10"
                            : "border-gray-200/90 hover:border-gray-300 hover:shadow-xs shadow-2xs"
                        }`}
                      >
                        {/* Card Top Accent Line when selected */}
                        {isSelected && (
                          <div className="h-0.5 bg-primary w-full" />
                        )}

                        {/* Clickable Header Row: Title & Badges on Left, Info (?) & Chevron on Right */}
                        <div
                          onClick={() => toggleExtraExpand(extraId)}
                          className={`px-3.5 py-2 sm:px-4 sm:py-2 flex items-center justify-between gap-3 cursor-pointer select-none transition-colors ${
                            isExpanded ? "border-b border-gray-150 bg-gray-50/40" : "hover:bg-gray-50/50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className={`w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-2xs ${
                                isSelected ? extraConfig.selectedClass : extraConfig.colorClass
                              }`}
                            >
                              {extraConfig.icon}
                            </div>

                            <div className="min-w-0 flex items-center gap-2 flex-wrap">
                              <h4 className="text-[14px] sm:text-[15px] font-bold text-gray-950 tracking-tight leading-snug">
                                {extra.name}
                              </h4>
                              {(extra.badge || extraConfig.defaultBadge) && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide bg-amber-100/90 text-amber-900 border border-amber-250/70 shadow-2xs shrink-0 flex items-center gap-1">
                                  <Star size={10} className="fill-amber-500 text-amber-500" />
                                  {extra.badge || extraConfig.defaultBadge}
                                </span>
                              )}
                              {isSelected && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-250 flex items-center gap-1 shrink-0">
                                  <Check size={11} className="stroke-[3]" /> Added
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Right Controls: Info (?) button and Chevron toggle */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Orange/Amber circular Info (?) Button */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedFaqExtra(extra);
                              }}
                              className="w-7 h-7 rounded-full text-amber-500 hover:text-amber-600 hover:bg-amber-50/80 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                              title={`Information & FAQs for ${extra.name}`}
                              aria-label={`Information & FAQs for ${extra.name}`}
                            >
                              <HelpCircle size={18} className="stroke-[2.2]" />
                            </button>

                            {/* Chevron Toggle Button */}
                            <div
                              className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-200/90 flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-2xs transition-all shrink-0"
                              title={isExpanded ? "Collapse" : "Expand"}
                            >
                              <ChevronDown
                                size={14}
                                className={`transition-transform duration-200 ${
                                  isExpanded ? "rotate-180 text-gray-800" : "text-gray-400"
                                }`}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Expanded Details Body: Clean readable description on Left, Price + Button on Right */}
                        {isExpanded && (
                          <div className="px-3.5 py-2.5 sm:px-4 sm:py-3 bg-slate-50/30 flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in-50 duration-150">
                            {/* Left: Description */}
                            <p className="text-[13px] sm:text-[13.5px] font-normal text-slate-700 leading-relaxed max-w-xl antialiased">
                              {extra.description || "Optional add-on service provided for your vehicle rental."}
                            </p>

                            {/* Right: Price (per day) and Action Button (Add / Remove) */}
                            <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2.5 md:pt-0 border-t md:border-t-0 border-gray-150">
                              {/* Price */}
                              <div className="text-right">
                                <div className="flex items-baseline justify-end gap-1">
                                  <span className="text-xs font-bold text-gray-500 tracking-wider">
                                    {currencyCode}
                                  </span>
                                  <span className="text-lg sm:text-xl font-black text-gray-950 font-sans tracking-tight">
                                    {Math.round(displayTotalPrice).toLocaleString()}
                                  </span>
                                </div>
                                <div className="text-[10px] font-bold text-gray-400 tracking-wider uppercase mt-0.5">
                                  {qty > 1 ? (
                                    <span>
                                      {qty} × {Math.round(displayUnitPrice).toLocaleString()} {currencyCode}
                                    </span>
                                  ) : rentalDays > 1 ? (
                                    `Total for ${rentalDays} days`
                                  ) : (
                                    "Total for rental"
                                  )}
                                </div>
                              </div>

                              {/* Action Button: Stepper for quantity or Add/Remove for boolean */}
                              <div onClick={(e) => e.stopPropagation()}>
                                {extra.type === "quantity" ? (
                                  isSelected ? (
                                    <div className="flex items-center gap-1.5 bg-gray-100/90 border border-gray-200/90 rounded-xl p-1 shadow-inner">
                                      <button
                                        type="button"
                                        onClick={() => handleExtraChange(extraId, Math.max(0, qty - 1))}
                                        className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center justify-center active:scale-90 transition-all shadow-2xs cursor-pointer"
                                        title="Decrease quantity"
                                      >
                                        <Minus size={13} strokeWidth={2.5} />
                                      </button>
                                      <span className="w-6 text-center text-xs font-black text-gray-950 font-sans select-none">
                                        {qty}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleExtraChange(extraId, Math.min(extra.max_qty || 3, qty + 1))
                                        }
                                        disabled={qty >= (extra.max_qty || 3)}
                                        className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-700 hover:bg-primary hover:text-gray-950 hover:border-primary flex items-center justify-center active:scale-90 transition-all disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-gray-700 shadow-2xs cursor-pointer"
                                        title="Increase quantity"
                                      >
                                        <Plus size={13} strokeWidth={2.5} />
                                      </button>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => handleExtraChange(extraId, 1)}
                                      className="min-w-[100px] px-5 py-2 rounded-xl bg-primary text-gray-950 font-bold text-xs hover:bg-primary-600 active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                    >
                                      <Plus size={15} strokeWidth={2.5} />
                                      <span>Add</span>
                                    </button>
                                  )
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleExtraChange(extraId, isSelected ? 0 : 1)}
                                    className={`min-w-[100px] px-5 py-2 rounded-xl font-bold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                                      isSelected
                                        ? "border-2 border-blue-600 text-blue-600 bg-white hover:bg-blue-50"
                                        : "bg-primary text-gray-950 hover:bg-primary-600 shadow-xs"
                                    }`}
                                  >
                                    {isSelected ? "Remove" : "+ Add"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}

                {/* View More / Show Fewer Add-ons Button */}
                {!isLoadingExtras && extrasList.length > 2 && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        userManuallyToggledExtrasRef.current = true;
                        setShowAllExtras((prev) => !prev);
                      }}
                      className="w-full py-3.5 px-5 bg-white hover:bg-gray-50 border-2 border-dashed border-gray-250 hover:border-gray-400 rounded-2xl md:rounded-3xl font-black text-xs sm:text-sm text-gray-800 transition-all flex items-center justify-center gap-2 shadow-2xs group cursor-pointer active:scale-[0.99] select-none"
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
            )}

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
