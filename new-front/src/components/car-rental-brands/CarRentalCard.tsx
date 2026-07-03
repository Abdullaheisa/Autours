"use client";

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

interface CarRentalCardProps {
  href: string;
  title: string;
  logo?: string; // If provided, shows Brand layout (white logo header + beige body)
  countryCode?: string; // If provided, shows Country layout (full beige, inline flagcdn image)
  id?: string;
}

export default function CarRentalCard({ href, title, logo, countryCode, id }: CarRentalCardProps) {
  const [imgSrc, setImgSrc] = useState(logo);

  useEffect(() => {
    setImgSrc(logo);
  }, [logo]);

  // Brand Card Layout (with White Header)
  if (logo) {
    return (
      <Link
        href={href}
        id={id}
        className="group relative flex flex-col h-full bg-gradient-to-b from-[#fbf9f6] to-[#f4eee6] border border-[#e5dcd0] rounded-2xl overflow-hidden hover:border-primary hover:shadow-[0_20px_40px_rgba(249,214,2,0.15)] hover:shadow-primary/10 transition-all duration-300 hover:-translate-y-1.5"
      >
        {/* Decorative Top Accent Line (Visible on Hover) */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />

        {/* Logo container */}
        <div className="bg-white flex items-center justify-center h-[72px] border-b border-[#e5dcd0]/60 transition-colors group-hover:bg-white/90">
          <div className="relative flex items-center justify-center w-[95px] h-[42px] transition-transform duration-300 group-hover:scale-105">
            <Image
              src={imgSrc || '/img/logo.png'}
              alt={`${title} logo`}
              fill
              className="object-contain"
              onError={() => setImgSrc('/img/logo.png')}
            />
          </div>
        </div>

        {/* Content body */}
        <div className="px-5 py-5 flex flex-col justify-between flex-1">
          <h3 className="font-extrabold text-[14.5px] text-gray-800 leading-snug tracking-tight group-hover:text-gray-900 transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-1.5 text-[12px] font-black text-gray-400 group-hover:text-primary transition-colors mt-3">
            <span className="uppercase tracking-wider">Explore</span>
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </div>
        </div>
      </Link>
    );
  }

  // Country Card Layout (Full Beige, Inline Flag)
  return (
    <Link
      href={href}
      id={id}
      className="group relative flex flex-col h-full bg-gradient-to-br from-[#f8f4ef] to-[#ece3d8] border border-[#e3d8c9] rounded-2xl overflow-hidden hover:border-primary hover:shadow-[0_20px_40px_rgba(249,214,2,0.15)] transition-all duration-300 hover:-translate-y-1.5"
    >
      {/* Decorative Top Accent Line (Visible on Hover) */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />

      <div className="p-6 flex flex-col justify-between flex-1">
        <div className="flex items-start gap-3.5">
          {countryCode && (
            <div className="shrink-0 rounded shadow-md overflow-hidden border border-black/5 w-[36px] h-[24px] relative mt-0.5">
              <Image
                src={`https://flagcdn.com/w40/${countryCode.toLowerCase()}.png`}
                alt=""
                fill
                className="object-cover"
              />
            </div>
          )}
          <h3 className="font-extrabold text-[15px] text-gray-800 leading-snug tracking-tight group-hover:text-gray-900 transition-colors">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-1.5 text-[12px] font-black text-gray-400 group-hover:text-primary transition-colors mt-5">
          <span className="uppercase tracking-wider">Explore</span>
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
