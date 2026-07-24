'use client';

import { useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import type { BrandBenefit } from '@/data/brandExtras';

interface BrandBenefitsSectionProps {
  brandName: string;
  benefits: BrandBenefit[];
}

export default function BrandBenefitsSection({ brandName, benefits }: BrandBenefitsSectionProps) {
  return (
    <section className="brand-benefits-section py-14 lg:py-20 bg-[#fafafa] border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ─── Header ─── */}
        <div className="mb-12 text-center">
          {/* Decorative accent line */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-[var(--primary)] rounded-full" />
            <span className="text-[12px] font-extrabold text-[var(--primary)] tracking-[0.2em] uppercase">
              Why Book with Autours
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-[var(--primary)] rounded-full" />
          </div>

          <h2 className="text-2xl md:text-[28px] font-black text-gray-900 tracking-tight leading-tight">
            Benefits of Booking&nbsp;
            <span
              style={{
                background: 'linear-gradient(90deg, #b08a00 0%, var(--primary) 50%, #e0b000 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {brandName}
            </span>
            &nbsp;Through Autours
          </h2>
          <p className="mt-3 text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
            Everything you need for a hassle-free car rental experience — all in one place.
          </p>
        </div>

        {/* ─── Benefits Grid (Tablet & Desktop) ─── */}
        <div className="hidden sm:grid grid-cols-2 lg:grid-cols-3 gap-5">
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} benefit={benefit} index={index} />
          ))}
        </div>

        {/* Mobile Horizontal scroll list */}
        <div className="flex sm:hidden overflow-x-auto gap-4 pb-6 no-scrollbar snap-x snap-mandatory px-4 -mx-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="w-[85vw] shrink-0 snap-center">
              <BenefitCard benefit={benefit} index={index} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .brand-benefits-section .benefit-card {
          background: #fff;
          border: 1px solid #f0f0f0;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
          cursor: default;
        }
        .brand-benefits-section .benefit-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.09);
          border-color: var(--primary);
        }
        .brand-benefits-section .benefit-icon-wrap {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          background: linear-gradient(135deg, #fff8e1 0%, #fff3cd 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.22s ease;
        }
        .brand-benefits-section .benefit-card:hover .benefit-icon-wrap {
          background: linear-gradient(135deg, #fff3cd 0%, var(--primary) 100%);
        }
        .brand-benefits-section .benefit-card:hover .benefit-icon-wrap svg {
          color: #fff;
        }
      `}</style>
    </section>
  );
}

function BenefitCard({ benefit, index }: { benefit: BrandBenefit; index: number }) {
  const IconComponent = useMemo(() => {
    const icons = LucideIcons as Record<string, any>;
    return icons[benefit.icon] || icons['Star'];
  }, [benefit.icon]);

  return (
    <div
      className="benefit-card"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="benefit-icon-wrap">
        <IconComponent size={22} className="text-[var(--primary)]" strokeWidth={2} />
      </div>
      <div>
        <h3 className="text-[15px] font-bold text-gray-900 mb-1 leading-snug">
          {benefit.title}
        </h3>
        <p className="text-[13.5px] text-gray-500 leading-relaxed">
          {benefit.description}
        </p>
      </div>
    </div>
  );
}
