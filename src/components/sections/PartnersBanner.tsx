'use client';

import { useState } from 'react';
import { Partner,PARTNERS } from '@/data/partnersBanner';



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
            className="inline-flex items-center justify-center shrink-0 px-6 md:px-8"
          >
            <img 
              src={partner.logoUrl}
              alt={`${partner.name} logo`}
              className="w-auto object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-300"
              style={{ height: 36, maxWidth: 140 }}
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `<span class="text-lg font-black tracking-tighter italic text-gray-400">${partner.name}</span>`;
                }
              }}
            />
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      {/* Gradient masks to fade out at edges */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
    </div>
  );
}