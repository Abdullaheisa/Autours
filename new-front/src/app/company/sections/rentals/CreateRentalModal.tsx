"use client";

import { useState, useEffect } from "react";
import { X, Calendar, Clock, MapPin, DollarSign, Loader2, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supplierApi } from "@/services/api/supplierApi";
import { bookingApi } from "@/services/api";
import toast from "react-hot-toast";

interface CreateRentalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateRentalModal({ isOpen, onClose }: CreateRentalModalProps) {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [vehicleId, setVehicleId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [timeFrom, setTimeFrom] = useState("10:00");
  const [timeTo, setTimeTo] = useState("10:00");
  const [currency, setCurrency] = useState("USD");
  const [pickupLoc, setPickupLoc] = useState("");

  // Customer Info
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const currencies = ["USD", "AED", "SAR", "EGP", "QAR", "KWD", "BHD", "OMR", "JOD"];

  useEffect(() => {
    if (isOpen) {
      setIsLoadingVehicles(true);
      supplierApi.getVehicles(1, 100)
        .then((res: any) => {
          // Extremely robust list extraction
          let list: any[] = [];
          if (res && Array.isArray(res.data)) {
            list = res.data;
          } else if (res && res.data && Array.isArray((res.data as any).data)) {
            list = (res.data as any).data;
          } else if (Array.isArray(res)) {
            list = res;
          } else if (res && Array.isArray(res.vehicles)) {
            list = res.vehicles;
          }
          setVehicles(list);
        })
        .catch((err) => {
          console.error("Failed to load company vehicles:", err);
          toast.error("Failed to load vehicle list.");
        })
        .finally(() => {
          setIsLoadingVehicles(false);
        });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!vehicleId) {
      toast.error("Please select a vehicle.");
      return;
    }
    if (!dateFrom) {
      toast.error("Please select a start date.");
      return;
    }
    if (!dateTo) {
      toast.error("Please select an end date.");
      return;
    }
    if (new Date(dateTo) <= new Date(dateFrom)) {
      toast.error("End date must be after start date.");
      return;
    }
    if (!pickupLoc.trim()) {
      toast.error("Please specify a pickup location.");
      return;
    }
    if (!customerName.trim()) {
      toast.error("Please enter a customer name.");
      return;
    }
    if (!customerEmail.trim()) {
      toast.error("Please enter a customer email.");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      id: Number(vehicleId),
      date_from: dateFrom,
      date_to: dateTo,
      time_from: timeFrom,
      time_to: timeTo,
      currency,
      pickupLoc: pickupLoc.trim(),
      customer_name: customerName.trim(),
      customer_email: customerEmail.trim(),
      customer_phone: customerPhone.trim(),
    };

    try {
      const res: any = await bookingApi.create(payload);
      if (res?.status || res?.data) {
        toast.success("Rental created successfully!");
        // Reset form
        setVehicleId("");
        setDateFrom("");
        setDateTo("");
        setTimeFrom("10:00");
        setTimeTo("10:00");
        setCurrency("USD");
        setPickupLoc("");
        setCustomerName("");
        setCustomerEmail("");
        setCustomerPhone("");
        onClose();
      } else {
        toast.error(res?.message || "Failed to create rental.");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || "Something went wrong.";
      toast.error(msg);
      console.error("CREATE RENTAL ERROR:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden p-6 z-10 mx-2 max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Create Manual Rental</h3>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 transition-colors"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto no-scrollbar py-4 flex-1">
              
              {/* Customer Info Section */}
              <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100 space-y-3">
                <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <User size={14} className="text-primary-500" />
                  Customer Information
                </h4>
                
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Email</label>
                      <input
                        type="email"
                        placeholder="john@example.com"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Phone</label>
                      <input
                        type="tel"
                        placeholder="+971..."
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Vehicle Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Select Vehicle
                </label>
                {isLoadingVehicles ? (
                  <div className="flex items-center gap-2 py-3 text-xs text-gray-500">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Loading vehicles...</span>
                  </div>
                ) : (
                  <select
                    value={vehicleId}
                    onChange={(e) => setVehicleId(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                  >
                    <option value="">Choose a vehicle...</option>
                    {vehicles.map((v: any) => (
                      <option key={v.id} value={v.id}>
                        {v.name || `Vehicle ID ${v.id}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Start Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    Start Time
                  </label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="time"
                      value={timeFrom}
                      onChange={(e) => setTimeFrom(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* End Date & Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    End Time
                  </label>
                  <div className="relative">
                    <Clock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="time"
                      value={timeTo}
                      onChange={(e) => setTimeTo(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Currency & Pickup Location */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    Currency
                  </label>
                  <div className="relative">
                    <DollarSign size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full pl-9 pr-2 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer"
                    >
                      {currencies.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block">
                    Pickup Location
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. Dubai Airport"
                      value={pickupLoc}
                      onChange={(e) => setPickupLoc(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-sm transition-colors uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-primary hover:bg-primary/95 text-black font-black rounded-xl text-sm transition-colors uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Rental</span>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
