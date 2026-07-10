'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Partner, PARTNERS } from '@/data/partnersBanner';
import { companyApi } from '@/services/api';
import { getLogoUrl } from '@/utils/getImageUrl';

interface PartnersBannerProps {
  speed?: number;
  pauseOnHover?: boolean;
}

export default function PartnersBanner({ 
  speed = 50,
  pauseOnHover = true 
}: PartnersBannerProps) {
  const [partners, setPartners] = useState<Partner[]>(PARTNERS);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    companyApi.getSuppliers()
      .then((res: any) => {
        const rawList = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        if (rawList.length > 0) {
          const mapped = rawList
            .filter((s: any) => s.logo && s.logo.trim() !== '')
            .map((s: any) => ({
              id: String(s.id),
              name: s.company || s.name || 'Partner',
              logoUrl: getLogoUrl(s.logo),
            }));
          if (mapped.length > 0) {
            setPartners(mapped);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load dynamic suppliers for marquee:', err);
      });
  }, []);

  let displayPartners = partners;
  if (displayPartners.length > 0 && displayPartners.length < 12) {
    while (displayPartners.length < 12) {
      displayPartners = [...displayPartners, ...displayPartners];
    }
  }

  return (
    <div className="relative bg-white py-6 border-y border-gray-100 overflow-hidden group">
      {/* Container holding both tracks side-by-side */}
      <div 
        className="flex whitespace-nowrap"
        onMouseEnter={() => pauseOnHover && setIsPaused(true)}
        onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      >
        {/* Track 1 */}
        <div 
          className="flex shrink-0 items-center justify-start min-w-full gap-2 md:gap-4"
          style={{
            animation: `marquee ${speed}s linear infinite`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
        >
          {displayPartners.map((partner, i) => (
            <div 
              key={`track1-${partner.id}-${i}`} 
              className="inline-flex items-center justify-center shrink-0 px-2 md:px-3"
            >
              <div className="relative h-9 w-28 md:w-32">
                <Image 
                  src={partner.logoUrl}
                  alt={`${partner.name} logo`}
                  fill
                  sizes="(max-width: 768px) 112px, 128px"
                  className="object-contain opacity-60 hover:opacity-100 transition-all duration-300"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Track 2 (Exact duplicate for seamless looping) */}
        <div 
          className="flex shrink-0 items-center justify-start min-w-full gap-2 md:gap-4"
          style={{
            animation: `marquee ${speed}s linear infinite`,
            animationPlayState: isPaused ? 'paused' : 'running',
          }}
          aria-hidden="true"
        >
          {displayPartners.map((partner, i) => (
            <div 
              key={`track2-${partner.id}-${i}`} 
              className="inline-flex items-center justify-center shrink-0 px-2 md:px-3"
            >
              <div className="relative h-9 w-28 md:w-32">
                <Image 
                  src={partner.logoUrl}
                  alt={`${partner.name} logo`}
                  fill
                  sizes="(max-width: 768px) 112px, 128px"
                  className="object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>

      {/* Gradient masks */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
    </div>
  );
}