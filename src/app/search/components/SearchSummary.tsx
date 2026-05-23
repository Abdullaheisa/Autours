'use client';

import { useSelector } from 'react-redux';
import { CheckCircle2, Calendar, Clock, Pencil, SlidersHorizontal } from 'lucide-react';
import { RootState } from '@/store';

interface SearchSummaryProps {
  onEditClick?: () => void;
  hideEditButton?: boolean;
  forceMobileLayout?: boolean;
}

export default function SearchSummary({ onEditClick, hideEditButton, forceMobileLayout }: SearchSummaryProps) {
  const { searchParams, count, daysNumber } = useSelector((state: RootState) => state.search);
  const currencyCode = useSelector((state: RootState) => state.currency.code);

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
      {/* Desktop + Tablet Header */}
      {!forceMobileLayout && (
        <div className="hidden md:flex items-center justify-between bg-yellow-50 px-5 py-3.5 border-b border-yellow-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={14} className="text-yellow-700" />
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-800">Your Search Details</h3>
          </div>
        </div>
      )}

      {/* Mobile Horizontal Bar (or forced mobile layout) */}
      <div className={`${forceMobileLayout ? 'block' : 'md:hidden'} relative`}>
        <div className={`flex flex-col sm:flex-row sm:items-center bg-yellow-50 ${!hideEditButton ? 'pr-12' : ''}`}>
          {/* Pickup Info */}
          <div className="flex-1 px-4 py-3 sm:border-r border-yellow-200">
            <p className="text-xs font-bold text-gray-800 truncate">
              {searchParams.location || 'Select Location'}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {searchParams.dateFrom ? formatDisplayDate(searchParams.dateFrom) : '--'}
              {' '}
              {searchParams.startTime || '10:00'}
            </p>
          </div>

          {/* Arrow connector */}
          <div className="hidden sm:flex items-center justify-center px-2">
            <div className="w-6 h-6 rounded-full bg-yellow-200 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-yellow-700">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </div>
          </div>

          {/* Return Info */}
          <div className="flex-1 px-4 py-3 border-t sm:border-t-0 border-yellow-200">
            <p className="text-xs font-bold text-gray-800 truncate">
              {searchParams.location || 'Select Location'}
            </p>
            <p className="text-[10px] text-gray-500 mt-0.5">
              {searchParams.dateTo ? formatDisplayDate(searchParams.dateTo) : '--'}
              {' '}
              {searchParams.endTime || '10:00'}
            </p>
          </div>
        </div>

        {/* Edit Button - opens side drawer */}
        {!hideEditButton && (
          <button
            onClick={onEditClick}
            className="absolute right-0 top-0 bottom-0 w-12 flex items-center justify-center bg-yellow-100 text-yellow-700 hover:bg-yellow-200 hover:text-gray-900 transition-colors"
            aria-label="Modify search"
          >
            <Pencil size={16} />
          </button>
        )}
      </div>

      {/* Desktop + Tablet Content */}
      {!forceMobileLayout && (
        <div className="hidden md:block p-5 space-y-5">
        {/* Pick-up */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Pick-up Location</h4>
          <div className="flex items-start gap-2 text-sm font-semibold text-gray-700">
            <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
            <p>{searchParams.location || 'Not selected'}</p>
          </div>
          {searchParams.dateFrom && (
            <div className="flex items-center gap-5 text-xs font-semibold text-gray-500 pl-6">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                {searchParams.dateFrom}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                {searchParams.startTime || '10:00'}
              </div>
            </div>
          )}
        </div>

        <div className="h-px bg-gray-100" />

        {/* Drop-off */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Drop-off Location</h4>
          <div className="flex items-start gap-2 text-sm font-semibold text-gray-700">
            <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
            <p>{searchParams.location || 'Not selected'}</p>
          </div>
          {searchParams.dateTo && (
            <div className="flex items-center gap-5 text-xs font-semibold text-gray-500 pl-6">
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                {searchParams.dateTo}
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={14} />
                {searchParams.endTime || '10:00'}
              </div>
            </div>
          )}
        </div>

        {/* Booking summary */}
        {daysNumber > 0 && (
          <>
            <div className="h-px bg-gray-100" />
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Duration</span>
              <span className="text-xs font-black text-gray-900">{daysNumber} {daysNumber === 1 ? 'Day' : 'Days'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500">Currency</span>
              <span className="text-xs font-black text-gray-900">{currencyCode}</span>
            </div>
          </>
        )}
      </div>
    )}
    </div>
  );
}