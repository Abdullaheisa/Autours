'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Partner, PARTNERS } from '@/data/partnersBanner';

interface PartnersBannerProps {
  partners?: Partner[];
  speed?: number;
  pauseOnHover?: boolean;
}

export default function PartnersBanner({ 
  partners = PARTNERS,
  speed = 40,
  pauseOnHover = true 
}: PartnersBannerProps) {
  const [isPaused, setIsPaused] = useState(false);
  const allPartners = [...partners, ...partners];

  return (
    <div className="relative bg-white py-6 border-y border-gray-100 overflow-hidden group">
      <div 
        className="flex whitespace-nowrap"
        style={{
          animation: `marquee ${speed}s linear infinite`,
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
        onMouseEnter={() => pauseOnHover && setIsPaused(true)}
        onMouseLeave={() => pauseOnHover && setIsPaused(false)}
      >
        {allPartners.map((partner, i) => (
          <div 
            key={`${partner.id}-${i}`} 
            // 🚀 التعديل هنا: قللنا الـ px-4 md:px-6 لـ px-2 md:px-3
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

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Gradient masks */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
    </div>
  );
}