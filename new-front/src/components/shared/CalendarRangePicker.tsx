'use client';

import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isBefore, startOfDay, addMonths, subMonths, isSameDay, isToday, format } from 'date-fns';

interface CalendarRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onSelect: (start: Date, end: Date) => void;
  onClose: () => void;
  singleMonth?: boolean;
  allowPastDates?: boolean;
}

export default function CalendarRangePicker({
  startDate,
  endDate,
  onSelect,
  onClose,
  singleMonth = false,
  allowPastDates = false,
}: CalendarRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempStart, setTempStart] = useState<Date | null>(startDate);
  const [tempEnd, setTempEnd] = useState<Date | null>(endDate);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const today = startOfDay(new Date());
  const nextMonth = addMonths(currentMonth, 1);

  const handleDateClick = useCallback((date: Date) => {
    if (!allowPastDates && isBefore(date, today)) return;

    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(date);
      setTempEnd(null);
    } else if (date < tempStart) {
      setTempStart(date);
      setTempEnd(null);
    } else {
      setTempEnd(date);
      onSelect(tempStart, date);
      setTimeout(onClose, 250);
    }
  }, [tempStart, tempEnd, onSelect, onClose, today, allowPastDates]);

  const getDayClasses = (dayDate: Date, isPast: boolean) => {
    let classes = 'h-8 sm:h-9 w-full flex items-center justify-center text-xs sm:text-sm font-bold transition-all duration-150 relative z-10 ';

    if (isPast) {
      classes += 'text-gray-300 cursor-not-allowed';
      return classes;
    }

    if (tempStart && isSameDay(dayDate, tempStart) || (tempEnd && isSameDay(dayDate, tempEnd))) {
      classes += 'bg-[#f9d602] text-gray-950 rounded-xl font-black shadow-xs';
      return classes;
    }

    if (tempStart && tempEnd && dayDate > tempStart && dayDate < tempEnd) {
      classes += 'bg-[#f9d602]/20 text-gray-900 rounded-none';
      return classes;
    }

    if (tempStart && !tempEnd && hoverDate && dayDate > tempStart && dayDate < hoverDate) {
      classes += 'bg-[#f9d602]/15 text-gray-900 rounded-none';
      return classes;
    }

    if (isToday(dayDate)) {
      classes += 'text-[#d4a000] font-black ring-2 ring-[#f9d602] rounded-xl';
      return classes;
    }

    classes += 'text-gray-700 hover:bg-[#f9d602]/20 hover:rounded-xl cursor-pointer';
    return classes;
  };

  const renderMonth = (date: Date, isPrimary: boolean = true) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = date.toLocaleString('en-US', { month: 'short' });
    const monthYear = date.toLocaleString('en-US', { year: 'numeric' });

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8 sm:h-9" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(year, month, d);
      const isPast = !allowPastDates && isBefore(dayDate, today);

      days.push(
        <button
          key={`day-${d}`}
          type="button"
          disabled={isPast}
          onClick={() => handleDateClick(dayDate)}
          onMouseEnter={() => !isPast && tempStart && !tempEnd && setHoverDate(dayDate)}
          className={getDayClasses(dayDate, isPast)}
        >
          {d}
        </button>
      );
    }

    return (
      <div className="flex-1 min-w-0">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-2.5">
          {isPrimary ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-xl text-gray-600 transition-all cursor-pointer"
              >
                <ChevronLeft size={17} strokeWidth={2.5} />
              </button>
              <span className="font-black text-gray-900 text-sm sm:text-base tracking-tight">
                {monthName} {monthYear}
              </span>
              <div className="w-7 sm:hidden" />
            </>
          ) : (
            <>
              <div className="w-7 hidden sm:block" />
              <span className="font-black text-gray-900 text-sm sm:text-base tracking-tight">
                {monthName} {monthYear}
              </span>
              <button
                type="button"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 rounded-xl text-gray-600 transition-all cursor-pointer"
              >
                <ChevronRight size={17} strokeWidth={2.5} />
              </button>
            </>
          )}
        </div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-[11px] sm:text-xs font-black text-gray-400 h-6 flex items-center justify-center">
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1" onMouseLeave={() => setHoverDate(null)}>
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden
                    ${singleMonth ? 'w-[290px] sm:w-[320px]' : 'w-[300px] sm:w-[560px]'}`}>
      <div className="p-4 sm:p-5">
        <div className={`flex gap-5 ${singleMonth ? '' : 'flex-col sm:flex-row'}`}>
          {renderMonth(currentMonth, true)}
          {!singleMonth && (
            <>
              <div className="hidden sm:block w-[1px] bg-gray-100 self-stretch shrink-0" />
              {renderMonth(nextMonth, false)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}