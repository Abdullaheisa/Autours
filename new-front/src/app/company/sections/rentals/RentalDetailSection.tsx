"use client";

import { useMemo } from "react";
import { ArrowLeft, Calendar, User, Car, MapPin, DollarSign, Clock, CheckCircle2, XCircle, ShieldCheck, Phone, Mail, FileText, Download, Printer, CreditCard } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import SectionLayout from "@/components/shared/SectionLayout";
import { rentals, Rental } from "@/lib/data";

interface RentalDetailSectionProps {
  id: string;
}

export default function RentalDetailSection({ id }: RentalDetailSectionProps) {
  const rental = useMemo(() => rentals.find(r => r.id === id), [id]);

  if (!rental) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <h2 className="text-xl font-bold text-gray-900">Rental Not Found</h2>
        <button 
          onClick={() => window.history.back()}
          className="mt-4 text-primary-600 font-bold hover:underline"
        >
          Go back to list
        </button>
      </div>
    );
  }

  return (
    <SectionLayout>
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => window.history.back()}
          className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-500 hover:text-primary-600 hover:border-primary-100 transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Booking #{rental.bookingNumber}</h1>
          <p className="text-sm text-gray-500 font-medium flex items-center gap-2 mt-1">
            <Calendar size={14} /> Created on {rental.startedAt}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 transition-all text-sm shadow-sm">
            <Download size={18} />
            Download PDF
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white font-bold rounded-2xl hover:bg-primary-700 transition-all text-sm shadow-lg shadow-primary-200">
            <Printer size={18} />
            Print Voucher
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column: Details */}
        <div className="xl:col-span-2 space-y-8">
          {/* Status Card */}
          <div className={`p-6 rounded-[2rem] border flex items-center justify-between ${
            rental.rentalStatus === "confirmed" ? "bg-emerald-50 border-emerald-100 text-emerald-700" : 
            rental.rentalStatus === "cancelled" ? "bg-red-50 border-red-100 text-red-700" : "bg-amber-50 border-amber-100 text-amber-700"
          }`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                rental.rentalStatus === "confirmed" ? "bg-emerald-500 text-white" : 
                rental.rentalStatus === "cancelled" ? "bg-red-500 text-white" : "bg-amber-500 text-white"
              }`}>
                {rental.rentalStatus === "confirmed" ? <CheckCircle2 size={24} /> : 
                 rental.rentalStatus === "cancelled" ? <XCircle size={24} /> : <Clock size={24} />}
              </div>
              <div>
                <h3 className="font-black text-lg uppercase tracking-wider">Status: {rental.rentalStatus}</h3>
                <p className="text-sm opacity-80 font-medium">Your rental is currently {rental.rentalStatus} and active in our system.</p>
              </div>
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
            <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
              <Car size={20} className="text-primary-600" />
              <h3 className="font-bold text-gray-900">Vehicle Information</h3>
            </div>
            <div className="p-8 flex flex-col md:flex-row gap-8">
              <div className="w-full md:w-64 aspect-[4/3] rounded-3xl bg-gray-100 overflow-hidden border border-gray-100 shadow-inner">
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Car size={64} />
                </div>
              </div>
              <div className="flex-1 space-y-6">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 leading-none">{rental.vehicle}</h2>
                  <p className="text-sm text-primary-600 font-bold mt-2 uppercase tracking-widest">Premium Sedan</p>
                </div>
                <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Transmission</p>
                    <p className="text-sm font-bold text-gray-700">Automatic</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Fuel Policy</p>
                    <p className="text-sm font-bold text-gray-700">Full to Full</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mileage</p>
                    <p className="text-sm font-bold text-emerald-600">Unlimited</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</p>
                    <p className="text-sm font-bold text-gray-700">Luxury</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer & Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
              <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
                <User size={20} className="text-primary-600" />
                <h3 className="font-bold text-gray-900">Customer Details</h3>
              </div>
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-black text-lg">
                    {rental.customerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">{rental.customerName}</p>
                    <p className="text-xs text-gray-400 font-medium">{rental.country}</p>
                  </div>
                </div>
                <div className="space-y-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-600 hover:text-primary-600 transition-colors cursor-pointer">
                    <Mail size={16} />
                    <span>customer@example.com</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold text-gray-600 hover:text-primary-600 transition-colors cursor-pointer">
                    <Phone size={16} />
                    <span>+971 50 123 4567</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
              <div className="p-6 border-b border-gray-50 bg-gray-50/30 flex items-center gap-2">
                <MapPin size={20} className="text-primary-600" />
                <h3 className="font-bold text-gray-900">Pickup & Drop-off</h3>
              </div>
              <div className="p-8 space-y-8">
                <div className="relative pl-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-primary-100 after:absolute after:left-1 after:top-0 after:w-4 after:h-4 after:rounded-full after:bg-primary-600 after:ring-4 after:ring-primary-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pickup Location</p>
                  <p className="text-sm font-bold text-gray-900">Dubai International Airport (DXB)</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">{rental.startedAt} @ 10:00 AM</p>
                </div>
                <div className="relative pl-8 after:absolute after:left-1 after:bottom-0 after:w-4 after:h-4 after:rounded-full after:bg-gray-300 after:ring-4 after:ring-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Drop-off Location</p>
                  <p className="text-sm font-bold text-gray-900">Dubai International Airport (DXB)</p>
                  <p className="text-xs text-gray-500 font-medium mt-1">{rental.endedAt} @ 10:00 AM</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pricing Summary */}
        <div className="space-y-8">
          <div className="bg-gray-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-gray-200 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black tracking-tight">Payment Details</h3>
                <CreditCard className="text-primary-400" />
              </div>
              <div className="space-y-5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-medium">Rental Charge ({rental.duration} days)</span>
                  <span className="font-bold">{rental.totalPrice}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-medium">Insurance (Standard)</span>
                  <span className="text-emerald-400 font-bold">Included</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 font-medium">Service Fees</span>
                  <span className="font-bold">0.00 AED</span>
                </div>
                <div className="pt-5 mt-5 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] mb-1">Total Amount</p>
                    <p className="text-3xl font-black tracking-tighter">{rental.totalPrice}</p>
                  </div>
                  <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black rounded-lg border border-emerald-500/20 uppercase tracking-widest mb-1">
                    Full Paid
                  </div>
                </div>
              </div>
              <button className="w-full mt-8 py-4 bg-white text-gray-900 font-black rounded-2xl hover:bg-primary-500 hover:text-white transition-all duration-300 transform group-hover:scale-[1.02]">
                Contact Customer
              </button>
            </div>
            {/* Decoration */}
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-primary-600/10 rounded-full blur-3xl" />
          </div>

          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 p-8 space-y-6">
            <h3 className="font-black text-gray-900 text-lg tracking-tight flex items-center gap-2">
              <ShieldCheck className="text-primary-600" />
              Included Protection
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mt-0.5">
                  <CheckCircle2 size={12} strokeWidth={3} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Collision Damage Waiver</p>
                  <p className="text-xs text-gray-500 mt-0.5">Fully covered with zero excess</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mt-0.5">
                  <CheckCircle2 size={12} strokeWidth={3} />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">Theft Protection</p>
                  <p className="text-xs text-gray-500 mt-0.5">24/7 security monitoring included</p>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-gray-50">
              <button className="text-sm font-bold text-primary-600 hover:underline flex items-center gap-1.5">
                <FileText size={16} />
                View Full Rental Terms
              </button>
            </div>
          </div>
        </div>
      </div>
    </SectionLayout>
  );
}
