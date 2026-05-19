'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { User, Mail, Globe, Phone, Lock, ArrowRight, CheckCircle2, ChevronDown, Car } from 'lucide-react';
import { worldCountries } from '@/data/worldCountries';

const benefits = [
  "No financial risk at all. The customers pay directly to you upon arrival.",
  "Immediate increase of your car rental sales.",
  "No entry/administration fee or other costs.",
  "Access to our agent area for special offers, stop sales, statistics, and evaluation results.",
  "Smart reservation procedure for confirming via email or Dashboard.",
  "Flexible system for amendments, cancellations, and one-way rentals.",
  "Guaranteed bookings and very low volume of no-show customers.",
];

function InputField({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
        {label}
      </label>
      <div className="relative group">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-[#EFBA07] transition-colors duration-200 z-10">
          {icon}
        </span>
        {children}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [phoneCode, setPhoneCode] = useState('+20');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const inputClass =
    'w-full h-14 bg-gray-50 border border-gray-200 focus:border-[#EFBA07] focus:bg-white rounded-2xl pl-12 pr-4 text-sm font-bold outline-none transition-all duration-200 focus:ring-4 focus:ring-yellow-400/10 text-gray-800';

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col lg:flex-row">

      {/* LEFT: Supplier Benefits (desktop only) */}
      <div className="hidden lg:flex lg:w-[45%] bg-gray-900 text-white items-center justify-center p-14 relative overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#EFBA07]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-0 w-72 h-72 bg-[#EFBA07]/8 rounded-full blur-3xl pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-md space-y-7"
        >
          <Link href="/" className="flex items-center gap-3 group mb-2">
            <div className="w-10 h-10 bg-[#EFBA07] rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-400/30 group-hover:scale-110 transition-transform">
              <Car size={20} className="text-gray-900" />
            </div>
            <span className="text-xl font-black text-white tracking-tighter">AUTOURS</span>
          </Link>

          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#EFBA07]/15 border border-[#EFBA07]/30 text-[#EFBA07] text-[11px] font-black uppercase tracking-widest rounded-full">
            <span className="w-1.5 h-1.5 bg-[#EFBA07] rounded-full animate-pulse" />
            Partner Program
          </span>

          <div>
            <h2 className="text-3xl font-black text-white tracking-tight leading-tight uppercase">
              Become a car<br />
              <span className="text-[#EFBA07]">rental supplier!</span>
            </h2>
            <div className="h-1 w-12 bg-[#EFBA07] mt-4 rounded-full" />
          </div>

          <p className="text-gray-300 text-sm leading-relaxed">
            Autours has been operating in the tourism field since{' '}
            <strong className="text-white">2005</strong>. Through our multilingual{' '}
            <span className="text-[#EFBA07] font-bold">www.autours.net</span>, millions of customers
            from different countries book their car rental every year.
          </p>

          <div className="pt-2 border-t border-white/10">
            <p className="text-[#EFBA07] text-[11px] font-black uppercase tracking-widest mb-4">
              Why join our network?
            </p>
            <ul className="space-y-3">
              {benefits.map((b, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.07 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 size={16} className="text-[#EFBA07] shrink-0 mt-0.5" strokeWidth={2.5} />
                  <span className="text-gray-400 text-xs leading-relaxed">{b}</span>
                </motion.li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>

      {/* RIGHT: Registration Form */}
      <div className="flex-1 lg:w-[55%] bg-white flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="w-full max-w-lg"
        >
          {/* Mobile Logo */}
          <Link href="/" className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-[#EFBA07] rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-400/30">
              <Car size={20} className="text-gray-900" />
            </div>
            <span className="text-xl font-black text-gray-900 tracking-tighter">AUTOURS</span>
          </Link>

          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 text-[10px] font-black uppercase tracking-widest rounded-full mb-3">
              Supplier Application
            </span>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
              Create Account
            </h1>
            <p className="text-gray-400 text-sm mt-2 font-medium">
              Join the Autours supplier network today.
            </p>
            <div className="h-1 w-12 bg-[#EFBA07] mt-3 rounded-full" />
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField icon={<User size={17} />} label="Full Name">
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  className={inputClass}
                />
              </InputField>

              <InputField icon={<Mail size={17} />} label="Email Address">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@autours.net"
                  className={inputClass}
                />
              </InputField>
            </div>

            <InputField icon={<Globe size={17} />} label="Country">
              <select
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className={`${inputClass} appearance-none`}
              >
                <option value="">Select Country...</option>
                {worldCountries.map((c) => (
                  <option key={c.iso} value={c.iso}>{c.name}</option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </InputField>

            <div className="flex gap-3">
              <div className="w-28 space-y-1.5">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                  Code
                </label>
                <select
                  value={phoneCode}
                  onChange={(e) => setPhoneCode(e.target.value)}
                  className="w-full h-14 bg-gray-50 border border-gray-200 focus:border-[#EFBA07] rounded-2xl text-xs font-bold text-center outline-none transition-all appearance-none"
                >
                  {worldCountries.map((c) => (
                    <option key={c.iso} value={c.code}>{c.iso} ({c.code})</option>
                  ))}
                </select>
              </div>
              <InputField icon={<Phone size={17} />} label="Phone Number">
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className={inputClass}
                />
              </InputField>
            </div>

            <InputField icon={<Lock size={17} />} label="Password">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </InputField>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full h-14 bg-[#EFBA07] hover:bg-yellow-400 text-gray-900 font-black rounded-2xl shadow-lg shadow-yellow-400/25 flex items-center justify-center gap-3 transition-all duration-200 active:scale-[0.98] group text-sm uppercase tracking-widest"
              >
                Create Account
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </div>

            <div className="text-center pt-1">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 text-[11px] font-black text-gray-400 hover:text-[#EFBA07] transition-colors duration-200 uppercase tracking-widest group"
              >
                Already have an account? Sign In
                <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
              </Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
