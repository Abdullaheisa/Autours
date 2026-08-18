"use client";

import React from "react";
import { 
  X, User, Mail, Phone, MapPin, Building2, Car, Calendar, 
  Clock, DollarSign, CreditCard, Shield, Star, Download, 
  Trash2, ExternalLink, Copy, Check, FileText, Globe, Tag
} from "lucide-react";
import { getVehicleImageUrl, getLogoUrl } from "@/utils/getImageUrl";
import { axiosClient } from "@/services/api/axiosClient";
import toast from "react-hot-toast";

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  rental: any | null;
}

export default function BookingDetailsModal({
  isOpen,
  onClose,
  rental
}: BookingDetailsModalProps) {
  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = originalBodyOverflow || "unset";
        document.documentElement.style.overflow = originalHtmlOverflow || "unset";
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen || !rental) return null;

  const handleCopy = (text: string, field: string) => {
    if (!text || text === "—") return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`Copied ${field} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDownloadInvoice = async () => {
    try {
      setIsDownloading(true);
      toast("Generating invoice...", { icon: "📄" });
      const response = await axiosClient.get(`/invoice/booking/${rental.id}`, {
        responseType: "blob"
      });
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoice-${rental.order_number || rental.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Invoice downloaded successfully!");
    } catch (err) {
      console.error("Failed to download invoice:", err);
      toast.error("Failed to download invoice.");
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toLowerCase();
    switch (s) {
      case "active":
      case "confirmed":
        return {
          bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
          dot: "bg-emerald-500",
          label: "Confirmed / Active"
        };
      case "upcoming":
      case "pending":
        return {
          bg: "bg-amber-50 text-amber-700 border-amber-200",
          dot: "bg-amber-500",
          label: "Pending / Upcoming"
        };
      case "completed":
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200",
          dot: "bg-blue-500",
          label: "Completed"
        };
      case "cancelled":
      case "canceled":
        return {
          bg: "bg-red-50 text-red-700 border-red-200",
          dot: "bg-red-500",
          label: "Cancelled"
        };
      default:
        return {
          bg: "bg-gray-50 text-gray-700 border-gray-200",
          dot: "bg-gray-400",
          label: status || "Unknown"
        };
    }
  };

  const statusBadge = getStatusBadge(rental.status);
  const vehiclePhotoUrl = rental.vehicle_photo ? getVehicleImageUrl(rental.vehicle_photo) : "";
  const supplierLogoUrl = rental.supplier_logo ? getLogoUrl(rental.supplier_logo) : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-4xl max-h-[92vh] rounded-3xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden border border-gray-100">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 via-white to-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-3.5 flex-wrap">
            <div className="bg-primary-50 p-2.5 rounded-2xl border border-primary-100/60 text-primary-600">
              <FileText size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  Booking {rental.order_number || `#${rental.id}`}
                </h2>
                <button
                  onClick={() => handleCopy(rental.order_number || String(rental.id), "Order Number")}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Copy Order Number"
                >
                  {copiedField === "Order Number" ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                <span>Booked on: {rental.created_at ? new Date(rental.created_at).toLocaleString() : rental.start_date || "—"}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.bg}`}>
              <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
              <span className="capitalize">{statusBadge.label}</span>
            </span>

            <button 
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-2xl transition-colors cursor-pointer"
              title="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full">
          
          {/* Top Grid: Customer Info & Supplier / Company Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* 1. Customer Information Card */}
            <div className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-gray-200/60">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                  <User size={17} className="text-primary-600" />
                  <span>Customer Details</span>
                </div>
                <span className="text-[11px] font-semibold text-gray-400 bg-white px-2 py-0.5 rounded-lg border border-gray-200">
                  ID: #{rental.customer_id || rental.raw?.customer_id || "—"}
                </span>
              </div>

              <div className="flex items-start gap-3.5 mb-4">
                <img 
                  src={rental.avatar} 
                  alt={rental.customer} 
                  className="w-12 h-12 rounded-2xl object-cover border border-gray-200 bg-white shadow-xs shrink-0" 
                />
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-bold text-gray-900 truncate">{rental.customer}</h3>
                  {rental.customer_gender && (
                    <span className="text-[11px] text-gray-500 capitalize">{rental.customer_gender}</span>
                  )}
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Email */}
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-gray-200/70">
                  <div className="flex items-center gap-2 min-w-0 text-gray-600">
                    <Mail size={14} className="text-gray-400 shrink-0" />
                    <span className="text-gray-900 font-medium truncate">{rental.customer_email || "—"}</span>
                  </div>
                  {rental.customer_email && (
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button 
                        onClick={() => handleCopy(rental.customer_email, "Email")}
                        className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors"
                        title="Copy Email"
                      >
                        {copiedField === "Email" ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      </button>
                      <a 
                        href={`mailto:${rental.customer_email}`}
                        className="p-1 text-primary-600 hover:text-primary-700 rounded transition-colors"
                        title="Send Email"
                      >
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-gray-200/70">
                  <div className="flex items-center gap-2 min-w-0 text-gray-600">
                    <Phone size={14} className="text-gray-400 shrink-0" />
                    <span className="text-gray-900 font-medium truncate">{rental.customer_phone || "—"}</span>
                  </div>
                  {rental.customer_phone && rental.customer_phone !== "—" && (
                    <div className="flex items-center gap-1 shrink-0 ml-2">
                      <button 
                        onClick={() => handleCopy(rental.customer_phone, "Phone")}
                        className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors"
                        title="Copy Phone"
                      >
                        {copiedField === "Phone" ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      </button>
                      <a 
                        href={`tel:${rental.customer_phone}`}
                        className="p-1 text-primary-600 hover:text-primary-700 rounded transition-colors"
                        title="Call Customer"
                      >
                        <ExternalLink size={13} />
                      </a>
                    </div>
                  )}
                </div>

                {/* Country / City */}
                <div className="flex items-center bg-white px-3 py-2 rounded-xl border border-gray-200/70 text-gray-600">
                  <Globe size={14} className="text-gray-400 shrink-0 mr-2" />
                  <span className="text-gray-500 mr-1.5">Location:</span>
                  <span className="text-gray-900 font-medium truncate">
                    {[rental.customer_city, rental.customer_country].filter(Boolean).join(", ") || rental.country || "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Company / Supplier Information Card */}
            <div className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-5 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-gray-200/60">
                <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                  <Building2 size={17} className="text-blue-600" />
                  <span>Supplier / Company</span>
                </div>
                <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                  Supplier
                </span>
              </div>

              <div className="flex items-start gap-3.5 mb-4">
                {supplierLogoUrl ? (
                  <img 
                    src={supplierLogoUrl} 
                    alt={rental.company} 
                    className="w-12 h-12 rounded-2xl object-contain p-1 border border-gray-200 bg-white shadow-xs shrink-0" 
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-base shrink-0 border border-blue-200">
                    <Building2 size={22} />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-base font-extrabold text-gray-900 truncate">{rental.company}</h3>
                  {rental.supplier_name && rental.supplier_name !== rental.company && (
                    <p className="text-xs text-gray-500 truncate">Contact: {rental.supplier_name}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Supplier Email */}
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-gray-200/70">
                  <div className="flex items-center gap-2 min-w-0 text-gray-600">
                    <Mail size={14} className="text-gray-400 shrink-0" />
                    <span className="text-gray-900 font-medium truncate">{rental.supplier_email || "—"}</span>
                  </div>
                  {rental.supplier_email && rental.supplier_email !== "—" && (
                    <button 
                      onClick={() => handleCopy(rental.supplier_email, "Supplier Email")}
                      className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors shrink-0 ml-2"
                      title="Copy Supplier Email"
                    >
                      {copiedField === "Supplier Email" ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    </button>
                  )}
                </div>

                {/* Supplier Phone */}
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-gray-200/70">
                  <div className="flex items-center gap-2 min-w-0 text-gray-600">
                    <Phone size={14} className="text-gray-400 shrink-0" />
                    <span className="text-gray-900 font-medium truncate">{rental.supplier_phone || "—"}</span>
                  </div>
                  {rental.supplier_phone && rental.supplier_phone !== "—" && (
                    <button 
                      onClick={() => handleCopy(rental.supplier_phone, "Supplier Phone")}
                      className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors shrink-0 ml-2"
                      title="Copy Supplier Phone"
                    >
                      {copiedField === "Supplier Phone" ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                    </button>
                  )}
                </div>

                {/* Supplier City / Country */}
                <div className="flex items-center bg-white px-3 py-2 rounded-xl border border-gray-200/70 text-gray-600">
                  <MapPin size={14} className="text-gray-400 shrink-0 mr-2" />
                  <span className="text-gray-500 mr-1.5">City / Country:</span>
                  <span className="text-gray-900 font-medium truncate">
                    {[rental.supplier_city, rental.supplier_country].filter(Boolean).join(", ") || rental.country || "—"}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Vehicle & Rental Period Section */}
          <div className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4 pb-2.5 border-b border-gray-200/60">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                <Car size={17} className="text-primary-600" />
                <span>Vehicle &amp; Rental Schedule</span>
              </div>
              {rental.vehicle_category && (
                <span className="text-[11px] font-bold text-primary-700 bg-primary-50 px-2.5 py-0.5 rounded-lg border border-primary-100">
                  {rental.vehicle_category}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* Car Photo */}
              <div className="md:col-span-4 bg-white rounded-2xl border border-gray-200 p-3 flex flex-col items-center justify-center min-h-[140px] shadow-xs">
                {vehiclePhotoUrl ? (
                  <img 
                    src={vehiclePhotoUrl} 
                    alt={rental.vehicle} 
                    className="max-h-28 w-auto object-contain drop-shadow-sm" 
                  />
                ) : (
                  <div className="text-gray-300 flex flex-col items-center">
                    <Car size={48} />
                    <span className="text-[10px] text-gray-400 mt-1">No photo available</span>
                  </div>
                )}
                <h4 className="text-sm font-black text-gray-900 text-center mt-2">{rental.vehicle}</h4>
              </div>

              {/* Booking Dates & Location Info */}
              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
                {/* Pick-up */}
                <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-1.5 text-gray-500 font-semibold mb-1">
                    <Calendar size={13} className="text-emerald-600" />
                    <span>Pick-up Date &amp; Time</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{rental.start_date || "—"}</p>
                  {rental.start_time && (
                    <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                      <Clock size={11} /> {rental.start_time}
                    </p>
                  )}
                </div>

                {/* Drop-off */}
                <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-1.5 text-gray-500 font-semibold mb-1">
                    <Calendar size={13} className="text-red-600" />
                    <span>Drop-off Date &amp; Time</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{rental.end_date || "—"}</p>
                  {rental.end_time && (
                    <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                      <Clock size={11} /> {rental.end_time}
                    </p>
                  )}
                </div>

                {/* Duration */}
                <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-1.5 text-gray-500 font-semibold mb-1">
                    <Clock size={13} className="text-blue-600" />
                    <span>Duration</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">{rental.duration || "—"}</p>
                </div>

                {/* Branch / Station Location */}
                <div className="bg-white p-3.5 rounded-xl border border-gray-200">
                  <div className="flex items-center gap-1.5 text-gray-500 font-semibold mb-1">
                    <MapPin size={13} className="text-amber-600" />
                    <span>Location / Branch</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 truncate" title={rental.vehicle_branch}>
                    {rental.vehicle_branch || rental.country || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing & Financial Details */}
          <div className="bg-gray-50/70 border border-gray-200/80 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-gray-200/60">
              <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
                <DollarSign size={17} className="text-emerald-600" />
                <span>Financial &amp; Payment Details</span>
              </div>
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                Total: {rental.amount}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-gray-200">
                <span className="text-gray-500 font-medium block mb-1">Customer Total Price</span>
                <span className="text-sm font-extrabold text-gray-900">{rental.amount || "—"}</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-gray-200">
                <span className="text-gray-500 font-medium block mb-1">Supplier Net Price</span>
                <span className="text-sm font-bold text-gray-800">
                  {rental.supplier_price ? `${rental.supplier_price} ${rental.currency || ""}` : "—"}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-gray-200">
                <span className="text-gray-500 font-medium block mb-1">Profit Margin</span>
                <span className="text-sm font-bold text-primary-600">
                  {rental.profit_margin !== undefined && rental.profit_margin !== null ? `${rental.profit_margin}%` : "—"}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-gray-200">
                <span className="text-gray-500 font-medium block mb-1">Payment Method</span>
                <span className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <CreditCard size={13} className="text-gray-400" />
                  {rental.payment_method || "Online"}
                </span>
              </div>
            </div>
          </div>

          {/* Rating & Review (if present) */}
          {(rental.rating > 0 || rental.comment) && (
            <div className="bg-amber-50/40 border border-amber-200/60 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-amber-200/50">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                  <Star size={16} className="text-amber-500 fill-amber-500" />
                  <span>Customer Review &amp; Rating</span>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      className={i < rental.rating ? "text-amber-500 fill-amber-500" : "text-gray-300"} 
                    />
                  ))}
                  <span className="text-xs font-bold text-amber-900 ml-1.5">{rental.rating} / 5</span>
                </div>
              </div>

              {rental.comment && (
                <div className="bg-white p-3 rounded-xl border border-amber-200/60 text-xs text-gray-700 italic">
                  &ldquo;{rental.comment}&rdquo;
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/80 flex items-center justify-end gap-2.5">
          <button
            onClick={handleDownloadInvoice}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 border border-gray-200 rounded-xl transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Download size={15} />
            <span>{isDownloading ? "Downloading..." : "Download Invoice PDF"}</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-white bg-primary-600 hover:bg-primary-700 rounded-xl transition-colors shadow-sm shadow-primary-200 cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
