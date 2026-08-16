'use client';
import Link from 'next/link';

interface Props {
  title?: string;
  description?: string;
  primaryText?: string;
  secondaryText?: string;
  locationName: string;
}

export default function LocationCTASection({
  title,
  description,
  primaryText = 'Search Cars Now',
  secondaryText = 'Contact Support',
  locationName,
}: Props) {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-black text-white p-8 md:p-16 text-center shadow-2xl">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-25"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1800&q=80')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/90 to-transparent" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-black uppercase tracking-wider mb-6">
              Ready to drive?
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tight font-title mb-6 leading-tight">
              {title || `Find Your Perfect ${locationName} Airport Rental Today`}
            </h2>
            <p className="text-white/70 text-base md:text-lg leading-relaxed font-medium mb-8">
              {description || `Compare deals from top suppliers across all ${locationName} airports. Free cancellation, no credit card fees, and instant confirmation.`}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                className="btn-primary px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-wider hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20 cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' });
                }}
                href="#search-section"
              >
                {primaryText}
              </a>
              <Link
                href="/contact-us"
                className="px-8 py-4 rounded-2xl text-sm font-black uppercase tracking-wider bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
              >
                {secondaryText}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
