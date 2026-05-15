'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import Navbar from '@/components/shared/layout/Navbar';
import Footer from '@/components/shared/layout/Footer';
import Stepper from '@/app/search/components/Stepper';
import SearchSummary from '@/app/search/components/SearchSummary';
import CarCard from '@/app/search/components/CarCard';
import { Check, Calendar, ChevronDown } from 'lucide-react';
import { RootState } from '@/store';
import { Vehicle } from '@/types';
import { worldCountries } from '@/data/worldCountries';
import ResultsSearchBar from '@/app/search/components/ResultsSearchBar';

function BookingContent() {
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get('vehicleId');
  const { vehicles, searchParams: searchStateParams, daysNumber } = useSelector((state: RootState) => state.search);
  const { code: currencyCode, rate } = useSelector((state: RootState) => state.currency);

  const selectedVehicle = vehicles.find((v: Vehicle) => v.id.toString() === vehicleId) || vehicles[0];
  
  // Calculations
  const dailyPrice = (selectedVehicle?.price_in_usd || 0) * rate;
  const totalPrice = Math.round(dailyPrice * daysNumber);
  const depositAmount = (totalPrice * 0.125).toFixed(2);
  const payAtPickup = (totalPrice - Number(depositAmount)).toFixed(2);

  return (
    <div className="max-w-[1400px] mx-auto px-4 py-10">
      {/* Mobile Search Summary */}
      <div className="lg:hidden mb-4">
        <SearchSummary hideEditButton={true} forceMobileLayout={true} />
      </div>

      {/* Mobile Results Search Bar (Editable Search) */}
      <div className="lg:hidden mb-6">
        <ResultsSearchBar
          onSearch={() => {
            console.log("Checking availability with new dates...");
          }}
          buttonText="Check Availability"
          readOnlyLocation={true}
          preventRedirect={true}
        />
      </div>

      {/* Mobile Car Card: Appears next on mobile */}
      <div className="lg:hidden mb-8">
        {selectedVehicle ? (
          <CarCard
            vehicle={selectedVehicle}
            daysNumber={daysNumber}
            hideBookingControls={true}
          />
        ) : (
          <div className="p-8 bg-white rounded-2xl border border-gray-100 text-center text-gray-500">
            No vehicle selected or found.
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* ==================================
            LEFT SIDEBAR: Details & Price (Invoice)
        ================================== */}
        <aside className="w-full lg:w-[320px] shrink-0 space-y-6">
          <div className="hidden lg:block">
            <SearchSummary hideEditButton={true} />
          </div>

          {/* Total Price Card (Invoice) */}
          <div className="bg-white rounded-2xl border-2 border-primary overflow-hidden shadow-lg shadow-primary/5">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-500 mb-2">Total Rental Price</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-gray-900 tracking-tighter">
                    {totalPrice.toLocaleString()}
                  </span>
                  <span className="text-4xl font-black text-gray-900 tracking-tighter">{currencyCode}</span>
                </div>
                <p className="text-xs font-bold text-green-600 mt-2 flex items-center gap-1">
                  <Check size={14} strokeWidth={3} /> For {daysNumber} {daysNumber === 1 ? 'day' : 'days'}
                </p>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between text-sm font-semibold text-gray-600">
                  <span>Daily Rate</span>
                  <span className="text-gray-900">{Math.round(dailyPrice).toLocaleString()} {currencyCode}</span>
                </div>
                <div className="flex justify-between text-sm font-semibold text-gray-600">
                  <span>Total Duration</span>
                  <span className="text-gray-900">{daysNumber} Days</span>
                </div>
                <div className="h-px bg-gray-50" />
                <div className="flex justify-between text-sm font-semibold text-gray-500">
                  <span>Pay at Pickup</span>
                  <span>{Number(payAtPickup).toLocaleString()} {currencyCode}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-sm font-black text-gray-900 uppercase tracking-wide">Grand Total</span>
                <span className="text-lg font-black text-gray-900">{totalPrice.toLocaleString()} {currencyCode}</span>
              </div>
            </div>
          </div>

          {/* Reusable Availability Check Card (Desktop Only) */}
          <div className="hidden lg:block">
            <ResultsSearchBar
              onSearch={() => {
                console.log("Checking availability with new dates...");
              }}
              buttonText="Check Availability"
              readOnlyLocation={true}
              preventRedirect={true}
            />
          </div>

        </aside>

        {/* ==================================
            RIGHT CONTENT: Main Layout
        ================================== */}
        <div className="flex-1 space-y-6 min-w-0">

          {/* Desktop Car Card: Hidden on mobile since it's shown above */}
          <div className="hidden lg:block">
            {selectedVehicle ? (
              <CarCard
                vehicle={selectedVehicle}
                daysNumber={daysNumber}
                hideBookingControls={true}
              />
            ) : (
              <div className="p-8 bg-white rounded-2xl border border-gray-100 text-center text-gray-500">
                No vehicle selected or found.
              </div>
            )}
          </div>

          {/* Register Form */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm space-y-8 mt-8">
            <div className="flex flex-col items-center mb-8">
              <h2 className="text-[22px] font-black tracking-tight text-gray-900">Register first to continue</h2>
              <div className="h-1 w-12 bg-primary mt-2 rounded-full" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <select className="w-full p-3.5 border border-gray-200 rounded-lg text-[15px] bg-white text-gray-700 outline-none focus:border-primary font-medium">
                <option value="">Mr / Mrs</option>
                <option value="mr">Mr</option>
                <option value="mrs">Mrs</option>
                <option value="miss">Miss</option>
                <option value="ms">Ms</option>
                <option value="dr">Dr</option>
              </select>
              <input type="text" placeholder="Enter Full name here..." className="w-full p-3.5 border border-gray-200 rounded-lg text-[15px] outline-none focus:border-primary placeholder:text-gray-400 font-medium" />

              <div className="flex gap-2">
                <select className="w-[120px] p-3.5 border border-gray-200 rounded-lg text-[14px] bg-white text-gray-700 outline-none focus:border-primary font-medium">
                  <option value="">Code...</option>
                  {worldCountries.map((pc, i) => (
                    <option key={i} value={pc.code}>{pc.iso} ({pc.code})</option>
                  ))}
                </select>
                <input type="text" placeholder="Phone Number..." className="flex-1 p-3.5 border border-gray-200 rounded-lg text-[15px] outline-none focus:border-primary placeholder:text-gray-400 font-medium" />
              </div>

              <select className="w-full p-3.5 border border-gray-200 rounded-lg text-[15px] bg-white text-gray-700 outline-none focus:border-primary font-medium">
                <option value="">Select Country...</option>
                {worldCountries.map((country, i) => (
                  <option key={i} value={country.name.toLowerCase()}>{country.name}</option>
                ))}
              </select>
              <input type="email" placeholder="Email Address (e.g. admin@autours.net)" className="w-full p-3.5 border border-gray-200 rounded-lg text-[15px] outline-none focus:border-primary placeholder:text-gray-400 font-medium md:col-span-1" />

              <input type="password" placeholder="Password..." className="w-full p-3.5 border border-gray-200 rounded-lg text-[15px] outline-none focus:border-primary placeholder:text-gray-400 font-medium" />
              <input type="password" placeholder="Confirm Password..." className="w-full p-3.5 border border-gray-200 rounded-lg text-[15px] outline-none focus:border-primary placeholder:text-gray-400 font-medium" />
            </div>

            <div className="space-y-5 pt-8 border-t border-gray-100">
              <Checkbox label="Remember me on this device." />
              <Checkbox
                label={
                  <>
                    I confirm that I have read, understood, and agree with the <a href="#" className="text-blue-600 hover:underline">Rental Terms</a> & <a href="#" className="text-blue-600 hover:underline">Autours terms</a>.
                  </>
                }
              />
              <Checkbox label="Subscribe me to promotional emails." />
            </div>

            <div className="pt-8 border-t border-gray-100">
              <button className="w-full md:w-auto md:min-w-[280px] mx-auto block py-4 px-8 bg-primary text-gray-900 rounded-md font-bold text-[16px] transition-all hover:bg-primary-600 active:scale-[0.98]">
                Continue To Payment
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-[#fcfcfc]">
      <Navbar />
      <Stepper currentStep={3} />

      {/* Mobile Search Summary moved inside BookingContent for better alignment */}

      <Suspense fallback={<div className="p-20 text-center">Loading...</div>}>
        <BookingContent />
      </Suspense>
      <Footer />
    </main>
  );
}

// ---------------------------
// Reusable Mini Components
// ---------------------------

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function Checkbox({ label }: { label: React.ReactNode }) {
  return (
    <label className="flex items-start gap-4 cursor-pointer group">
      <div className="relative flex items-center justify-center w-5 h-5 rounded border border-gray-300 group-hover:border-gray-400 transition-colors bg-white shrink-0 mt-0.5">
        <input type="checkbox" className="peer opacity-0 absolute inset-0 cursor-pointer" />
        <Check size={14} className="text-gray-900 opacity-0 peer-checked:opacity-100 transition-opacity stroke-[3px]" />
      </div>
      <span className="text-[15px] font-medium text-gray-700 select-none">
        {label}
      </span>
    </label>
  );
}