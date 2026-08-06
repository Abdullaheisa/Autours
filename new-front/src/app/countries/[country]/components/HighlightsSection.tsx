'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { MapPin, ChevronLeft, ChevronRight, ArrowRight, Star } from 'lucide-react';

/* ─── Types ──────────────────────────────────────────────── */
interface Attraction {
  name: string;
  description: string;
  image: string;
}
interface Place {
  name: string;
  description: string;
  image?: string;
  tags?: string[];
  attractions?: Attraction[];
}
interface HighlightsData {
  title?: string;
  subtitle?: string;
  places: Place[];
}
interface Props {
  highlights: HighlightsData;
  countryName: string;
}

/* ─── Constants ──────────────────────────────────────────── */
const FALLBACK =
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80';
const AUTO_MS = 4000;

/* ─── Modal ──────────────────────────────────────────────── */
function PlaceModal({
  place,
  countryName,
  onClose,
}: {
  place: Place;
  countryName: string;
  onClose: () => void;
}) {
  const [heroErr, setHeroErr] = useState(false);
  const [attrErrors, setAttrErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const hasAttractions = place.attractions && place.attractions.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6"
      style={{ animation: 'fadeInModal 0.2s ease both' }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

      {/* Panel wrapper — outer keeps close btn fixed, inner scrolls */}
      <div
        className="relative z-10 w-full max-w-2xl shadow-2xl rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col bg-white"
        style={{ maxHeight: '90vh', animation: 'slideUpModal 0.3s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        {/* ── Sticky Close Button (always above everything) ── */}
        <button
          onClick={(e) => { e.stopPropagation(); onClose(); }}
          aria-label="Close"
          className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer border border-white/20 shadow-xl"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto">

          {/* ── Hero Image ── */}
          <div className="relative h-44 sm:h-72 shrink-0">
            <img
              src={heroErr ? FALLBACK : place.image || FALLBACK}
              alt={place.name}
              onError={() => setHeroErr(true)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 pb-4 sm:pb-6">
              <h2 className="text-white text-xl sm:text-3xl font-black uppercase italic font-title leading-tight flex items-center gap-2 drop-shadow-lg">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-primary shrink-0" />
                {place.name}
              </h2>
            </div>
          </div>

          {/* ── Info Block ── */}
          <div className="px-4 sm:px-6 pt-4 sm:pt-5 pb-3 sm:pb-4">
            {/* Description */}
            <p className="text-gray-600 text-xs sm:text-base leading-relaxed font-medium">
              {place.description}
            </p>
          </div>

          {/* ── Attractions ── */}
          {hasAttractions && (
            <div className="px-4 sm:px-6 pb-6">
              {/* Section header */}
              <div className="flex items-center gap-2 py-3.5 sm:py-4 border-t border-gray-100 mb-4 sm:mb-5">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-gray-800">
                  Top Attractions
                </h3>
              </div>

              <div className="flex flex-col gap-6 sm:gap-8">
                {place.attractions!.map((attr, idx) => (
                  <div key={attr.name}>
                    {/* Alternating layout: even = img left, odd = img right */}
                    <div className={`flex flex-col sm:flex-row gap-3 sm:gap-4 ${idx % 2 === 1 ? 'sm:flex-row-reverse' : ''}`}>
                      {/* Image */}
                      <div className="w-full sm:w-2/5 shrink-0 rounded-xl sm:rounded-2xl overflow-hidden">
                        <img
                          src={attrErrors[idx] ? FALLBACK : attr.image}
                          alt={attr.name}
                          onError={() => setAttrErrors((e) => ({ ...e, [idx]: true }))}
                          loading="lazy"
                          className="w-full h-36 sm:h-48 object-cover"
                        />
                      </div>
                      {/* Text */}
                      <div className="flex-1 flex flex-col justify-center gap-1.5 sm:gap-2 py-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-primary text-black text-[9px] font-black flex items-center justify-center shrink-0">
                            {String(idx + 1).padStart(2, '0')}
                          </span>
                          <h4 className="text-gray-900 text-xs sm:text-sm font-black uppercase tracking-wide">
                            {attr.name}
                          </h4>
                        </div>
                        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-medium">
                          {attr.description}
                        </p>
                      </div>
                    </div>

                    {/* Divider between attractions (not after last) */}
                    {idx < place.attractions!.length - 1 && (
                      <div className="mt-6 sm:mt-8 border-t border-dashed border-gray-100" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes fadeInModal  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUpModal { from { opacity: 0; transform: translateY(28px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
      `}</style>
    </div>
  );
}

/* ─── Card ───────────────────────────────────────────────── */
function PlaceCard({ place, index, onClick }: { place: Place; index: number; onClick: () => void }) {
  const [err, setErr] = useState(false);
  const hasAttractions = place.attractions && place.attractions.length > 0;

  return (
    <article
      onClick={onClick}
      className="group relative bg-white rounded-2xl overflow-hidden cursor-pointer border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all duration-300 select-none w-full"
      style={{ height: '320px' }}
    >
      {/* Image */}
      <div className="relative overflow-hidden" style={{ height: '170px' }}>
        <img
          src={err ? FALLBACK : place.image || FALLBACK}
          alt={place.name}
          onError={() => setErr(true)}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        {/* Hover hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="bg-primary text-black text-xs font-black uppercase tracking-wider px-4 py-2 rounded-full flex items-center gap-1.5 shadow-lg">
            <ArrowRight className="w-3.5 h-3.5" /> Explore
          </span>
        </div>

        {/* Name + index */}
        <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
          <h3 className="text-white text-sm font-black leading-tight drop-shadow flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
            {place.name}
          </h3>
          <span className="w-6 h-6 rounded-full bg-primary text-black text-[10px] font-black flex items-center justify-center shadow shrink-0">
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 overflow-hidden" style={{ height: '150px' }}>
        <p className="text-gray-500 text-xs leading-relaxed font-medium line-clamp-4">
          {place.description}
        </p>
        {hasAttractions && (
          <p className="text-primary text-[10px] font-black uppercase tracking-wide mt-auto shrink-0 flex items-center gap-1">
            <Star className="w-3 h-3 fill-primary" />
            {place.attractions!.length} top attractions inside
          </p>
        )}
      </div>
    </article>
  );
}

/* ─── Main Section ───────────────────────────────────────── */
export default function HighlightsSection({ highlights, countryName }: Props) {
  const places = highlights?.places ?? [];
  const total = places.length;

  const [visibleCount, setVisibleCount] = useState(3);
  const [sliderIdx, setSliderIdx] = useState(0);
  const [modalIdx, setModalIdx] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  // Responsive visible count
  useEffect(() => {
    const updateVisible = () => {
      if (window.innerWidth < 640) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };
    updateVisible();
    window.addEventListener('resize', updateVisible);
    return () => window.removeEventListener('resize', updateVisible);
  }, []);

  const maxIdx = Math.max(0, total - visibleCount);

  const slideTo = useCallback((n: number) => setSliderIdx(Math.max(0, Math.min(n, maxIdx))), [maxIdx]);
  const sliderPrev = () => slideTo(sliderIdx - 1);
  const sliderNext = () => slideTo(sliderIdx + 1);

  const openModal  = (i: number) => { setModalIdx(i); setPaused(true); };
  const closeModal = useCallback(() => { setModalIdx(null); setPaused(false); }, []);

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diffX = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;
    if (diffX > minSwipeDistance) {
      sliderNext(); // swipe left -> go to next
    } else if (diffX < -minSwipeDistance) {
      sliderPrev(); // swipe right -> go to prev
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Reset slider index if visibleCount changes out of bounds
  useEffect(() => {
    if (sliderIdx > maxIdx) {
      setSliderIdx(maxIdx);
    }
  }, [maxIdx, sliderIdx]);

  // Auto-play
  useEffect(() => {
    if (paused || total <= visibleCount) return;
    const id = setTimeout(() => setSliderIdx((i) => (i >= maxIdx ? 0 : i + 1)), AUTO_MS);
    return () => clearTimeout(id);
  }, [sliderIdx, paused, total, maxIdx, visibleCount]);

  if (!places.length) return null;

  const sectionTitle = highlights.title || `Top Places to Visit in ${countryName}`;
  const sectionSubtitle = highlights.subtitle || `Explore ${countryName}'s most iconic destinations with the freedom of your own rental car.`;

  const gap = 20; // 20px gap
  const cardWidth = `calc((100% - ${(visibleCount - 1) * gap}px) / ${visibleCount})`;
  const translateX = `calc(-${sliderIdx} * (${cardWidth} + ${gap}px))`;

  return (
    <>
      <section
        className="py-10 sm:py-14 bg-gray-50"
        aria-label={`Top destinations in ${countryName}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => { if (modalIdx === null) setPaused(false); }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 sm:mb-8">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-primary bg-primary/10 border border-primary/20 px-3 py-1 rounded-full mb-2.5">
                <MapPin className="w-3 h-3" /> Top Destinations
              </span>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-black uppercase italic tracking-tight font-title leading-snug">
                {sectionTitle}
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm font-medium mt-1 max-w-xl leading-relaxed">
                {sectionSubtitle}
              </p>
            </div>

            {total > visibleCount && (
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <span className="text-xs font-bold text-gray-400 mr-1">
                  {sliderIdx + 1}–{Math.min(sliderIdx + visibleCount, total)} of {total}
                </span>
                <button onClick={sliderPrev} disabled={sliderIdx === 0} aria-label="Previous" className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:border-primary hover:bg-primary hover:text-black text-gray-500 disabled:opacity-25 transition-all flex items-center justify-center cursor-pointer shadow-sm">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={sliderNext} disabled={sliderIdx >= maxIdx} aria-label="Next" className="w-8 h-8 rounded-full border border-gray-200 bg-white hover:border-primary hover:bg-primary hover:text-black text-gray-500 disabled:opacity-25 transition-all flex items-center justify-center cursor-pointer shadow-sm">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Slider with Touch Swipe support */}
          <div
            className="overflow-hidden touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div
              className="flex gap-5 transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
              style={{ transform: `translateX(${translateX})` }}
            >
              {places.map((place, i) => (
                <div key={place.name} className="shrink-0" style={{ width: cardWidth }}>
                  <PlaceCard place={place} index={i} onClick={() => openModal(i)} />
                </div>
              ))}
            </div>
          </div>

          {/* Dots */}
          {total > visibleCount && (
            <div className="flex justify-center gap-1.5 mt-5 sm:mt-6">
              {Array.from({ length: maxIdx + 1 }).map((_, i) => (
                <button key={i} onClick={() => slideTo(i)} aria-label={`Slide ${i + 1}`} className={`rounded-full transition-all duration-300 cursor-pointer ${i === sliderIdx ? 'bg-primary w-5 h-2' : 'bg-gray-300 hover:bg-gray-400 w-2 h-2'}`} />
              ))}
            </div>
          )}

          <p className="text-center text-gray-400 text-xs font-semibold mt-4 sm:mt-5">
            Click any card to explore attractions &amp; details
          </p>
        </div>
      </section>

      {modalIdx !== null && (
        <PlaceModal
          place={places[modalIdx]}
          countryName={countryName}
          onClose={closeModal}
        />
      )}
    </>
  );
}

