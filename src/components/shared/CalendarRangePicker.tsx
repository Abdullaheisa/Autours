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
}

export default function CalendarRangePicker({
  startDate,
  endDate,
  onSelect,
  onClose,
  singleMonth = false,
}: CalendarRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempStart, setTempStart] = useState<Date | null>(startDate);
  const [tempEnd, setTempEnd] = useState<Date | null>(endDate);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);

  const today = startOfDay(new Date());
  const nextMonth = addMonths(currentMonth, 1);

  const handleDateClick = useCallback((date: Date) => {
    if (isBefore(date, today)) return;

    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(date);
      setTempEnd(null);
    } else if (date < tempStart) {
      setTempStart(date);
      setTempEnd(null);
    } else {
      setTempEnd(date);
      onSelect(tempStart, date);
      setTimeout(onClose, 300);
    }
  }, [tempStart, tempEnd, onSelect, onClose, today]);

  const getDayClasses = (dayDate: Date, isPast: boolean) => {
    const isStart = tempStart && isSameDay(dayDate, tempStart);
    const isEnd = tempEnd && isSameDay(dayDate, tempEnd);
    const isCurrentDay = isToday(dayDate);

    let isInRange = false;
    if (tempStart && tempEnd && dayDate > tempStart && dayDate < tempEnd) {
      isInRange = true;
    } else if (tempStart && !tempEnd && hoverDate && dayDate > tempStart && dayDate < hoverDate) {
      isInRange = true;
    }

    // Base classes - compact
    let classes = 'h-8 w-full flex items-center justify-center text-[13px] font-bold transition-all duration-150 relative z-10 ';

    if (isPast) {
      classes += 'text-gray-300 cursor-not-allowed';
      return classes;
    }

    if (isStart || isEnd) {
      classes += 'bg-[#f9d602] text-gray-900 rounded-lg shadow-sm shadow-[#f9d602]/30';
      return classes;
    }

    if (isInRange) {
      classes += 'bg-[#f9d602]/15 text-gray-800';
      return classes;
    }

    if (isCurrentDay) {
      classes += 'text-[#d4a000] font-black ring-2 ring-[#f9d602]/40 rounded-lg';
      return classes;
    }

    classes += 'text-gray-600 hover:bg-gray-100 hover:rounded-lg cursor-pointer';
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
      days.push(<div key={`empty-${i}`} className="h-8" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dayDate = new Date(year, month, d);
      const isPast = isBefore(dayDate, today);
      const dayClasses = getDayClasses(dayDate, isPast);

      days.push(
        <button
          key={d}
          type="button"
          disabled={isPast}
          onClick={() => handleDateClick(dayDate)}
          onMouseEnter={() => !isPast && setHoverDate(dayDate)}
          onMouseLeave={() => setHoverDate(null)}
          className={dayClasses}
        >
          {d}
        </button>
      );
    }

    return (
      <div className={`flex-1 min-w-0 ${!isPrimary ? 'hidden sm:block' : ''}`}>
        {/* Compact Month Header */}
        <div className="flex items-center justify-between mb-3 px-1">
          {isPrimary ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg text-gray-400 transition-all"
              >
                <ChevronLeft size={16} strokeWidth={2.5} />
              </button>
              <div className="text-center">
                <span className="font-black text-gray-800 text-sm tracking-tight">
                  {monthName} {monthYear}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="w-7 h-7 flex items-center justify-center hover:bg-gray-100 active:bg-gray-200 rounded-lg text-gray-400 transition-all"
              >
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </>
          ) : (
            <div className="text-center w-full">
              <span className="font-black text-gray-800 text-sm tracking-tight">
                {monthName} {monthYear}
              </span>
            </div>
          )}
        </div>

        {/* Compact Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i} className="text-[10px] font-black text-gray-400 h-6 flex items-center justify-center uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Compact Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-xl shadow-xl shadow-black/8 border border-gray-100 overflow-hidden
                    ${singleMonth ? 'w-[280px] sm:w-[300px]' : 'w-[280px] sm:w-[560px]'}`}>

      {/* Calendar Body - Compact */}
      <div className="p-4">
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