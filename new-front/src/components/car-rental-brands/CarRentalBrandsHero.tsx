import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { assets } from '@/config/assets';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface HeroStat {
  value: string;
  label: string;
}

interface CarRentalBrandsHeroProps {
  breadcrumbs: BreadcrumbItem[];
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: string;
  stats?: HeroStat[];
  imageAlt?: string;
  imageSrc?: string;
  brandLogo?: { src: string; alt: string };
}

export default function CarRentalBrandsHero({
  breadcrumbs,
  title,
  description,
  badge,
  stats,
  imageAlt = 'Car rental destinations hero',
  imageSrc = assets.hero.background,
  brandLogo,
}: CarRentalBrandsHeroProps) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb" className="mb-5">
        <ol className="inline-flex flex-wrap items-center gap-0.5 px-3 py-2 rounded-2xl bg-gray-50/80 border border-gray-100 text-xs font-bold text-gray-500">
          <li>
            <Link
              href="/"
              className="inline-flex items-center justify-center w-6 h-6 rounded-md hover:bg-white hover:shadow-sm transition-all"
            >
              🔥
            </Link>
          </li>
          {breadcrumbs.map((item, i) => (
            <li key={i} className="flex items-center gap-0.5">
              <ChevronRight size={12} className="text-gray-300 shrink-0 mx-0.5" />
              {item.href ? (
                <Link
                  href={item.href}
                  className="px-2 py-0.5 rounded-md hover:bg-white hover:text-primary transition-all"
                >
                  {item.label}
                </Link>
              ) : (
                <span className="px-2 py-0.5 text-gray-900 font-black">{item.label}</span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-[1.75rem] md:rounded-[2.25rem] min-h-[420px] md:min-h-[400px] lg:min-h-[420px] shadow-[0_32px_80px_-24px_rgba(0,0,0,0.35)]">
        {/* Background image — full color */}
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          className="object-cover object-[70%_center] md:object-center scale-105"
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10 md:bg-gradient-to-r md:from-black/55 md:via-black/25 md:to-black/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_50%,transparent_0%,rgba(0,0,0,0.15)_100%)]" />

        {/* Decorative grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Content layout */}
        <div className="relative z-10 flex flex-col justify-end md:justify-center h-full min-h-[420px] md:min-h-[400px] lg:min-h-[420px] p-5 sm:p-6 md:p-8 lg:p-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            {/* White content card */}
            <div className="relative bg-white rounded-[1.5rem] md:rounded-[1.75rem] rounded-tr-[2.5rem] md:rounded-tr-[3.5rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] max-w-full md:max-w-[500px] lg:max-w-[540px] overflow-hidden">
              {/* Yellow accent bar */}
              <div className="h-1.5 bg-primary" />

              <div className="px-6 py-7 sm:px-8 sm:py-8 md:px-9 md:py-9">
                {badge && (
                  <span className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-full bg-gray-900 text-primary text-[10px] font-black uppercase tracking-[0.15em]">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    {badge}
                  </span>
                )}

                <h1 className="text-[1.65rem] sm:text-[1.85rem] md:text-[2rem] lg:text-[2.25rem] font-black tracking-tight text-gray-900 leading-[1.12] mb-4">
                  {title}
                </h1>

                {description && (
                  <div className="text-[13.5px] sm:text-[14px] text-gray-500 leading-[1.85] font-medium">
                    {description}
                  </div>
                )}

                {stats && stats.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 mt-6 pt-6 border-t border-gray-100">
                    {stats.map((stat) => (
                      <div
                        key={stat.label}
                        className="flex flex-col px-4 py-2.5 rounded-xl bg-[#f8f5f1] border border-[#ede8e1] min-w-[80px]"
                      >
                        <span className="text-lg font-black text-gray-900 leading-none">{stat.value}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                          {stat.label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Brand logo — desktop */}
            {brandLogo && (
              <div className="hidden md:flex shrink-0 self-end mb-2">
                <div className="relative bg-white rounded-xl shadow-2xl p-0 ring-4 ring-white/20 w-[120px] h-[60px] flex items-center justify-center">
                  <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-primary border-2 border-white z-10" />
                  <Image
                    src={brandLogo.src}
                    alt={brandLogo.alt}
                    width={120}
                    height={60}
                    className="object-contain max-h-[60px] w-[120px] select-none"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Brand logo — mobile */}
          {brandLogo && (
            <div className="md:hidden flex justify-end -mt-2">
              <div className="bg-white rounded-xl shadow-lg p-0 w-[120px] h-[60px] flex items-center justify-center overflow-hidden">
                <Image
                  src={brandLogo.src}
                  alt={brandLogo.alt}
                  width={120}
                  height={60}
                  className="object-contain max-h-[60px] w-[120px] select-none"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
