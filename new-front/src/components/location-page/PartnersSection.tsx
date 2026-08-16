'use client';
import { useState } from 'react';
import Link from 'next/link';
import { getLogoUrl } from '@/utils/getImageUrl';
import { toSlug } from '@/utils/format';

interface Company {
  id: number;
  name: string;
  logo: string;
  company?: string;
}

interface Props {
  companies: Company[];
  locationName: string;
  description?: string;
}

const PartnerLogo = ({ company }: { company: Company }) => {
  const [hasError, setHasError] = useState(false);
  const logoUrl = getLogoUrl(company.logo);

  if (hasError || !logoUrl) {
    return (
      <span className="text-sm font-black text-gray-800 tracking-wider uppercase truncate max-w-full px-2">
        {company.name}
      </span>
    );
  }

  return (
    <img
      src={logoUrl}
      alt={company.name}
      onError={() => setHasError(true)}
      className="w-full h-full object-contain transition-all duration-300"
    />
  );
};

export default function PartnersSection({ companies, locationName, description }: Props) {
  if (companies.length === 0) return null;

  const total = companies.length;
  let h = 1;
  while (((h + 1) * (h + 2)) / 2 <= total) h++;

  const rowSizes: number[] = [];
  for (let i = h; i >= 1; i--) rowSizes.push(i);

  let remainder = total - (h * (h + 1)) / 2;
  let idx = 0;
  while (remainder > 0) {
    rowSizes[idx]++;
    remainder--;
    idx = (idx + 1) % rowSizes.length;
  }

  const rows: Company[][] = [];
  const temp = [...companies];
  for (const size of rowSizes) {
    rows.push(temp.splice(0, size));
  }

  return (
    <section className="py-14 overflow-hidden bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-10">
        <span className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-4 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Trusted Partners
        </span>
        <h3 className="text-2xl md:text-3xl font-black text-black uppercase italic tracking-tight font-title mt-3">
          Our Trusted Car Rental Suppliers in {locationName}
        </h3>
        {description && (
          <p className="text-gray-500 mt-3 text-sm md:text-base font-semibold max-w-4xl mx-auto leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-3">
        {rows.map((row, rowIdx) => (
          <div key={rowIdx} className="flex items-center justify-center gap-2 sm:gap-3">
            {row.map((company) => {
              const brandName = company.company || company.name;
              const brandSlug = toSlug(brandName);
              return (
                <Link key={company.id} href={`/car-rental-brands/${brandSlug}`} title={company.name}>
                  <div className="bg-white border border-gray-100 hover:border-primary rounded-xl p-1.5 flex items-center justify-center w-[80px] h-[40px] sm:w-[120px] sm:h-[60px] flex-shrink-0 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md">
                    <PartnerLogo company={company} />
                  </div>
                </Link>
              );
            })}
          </div>
        ))}
      </div>
    </section>
  );
}
