'use client';

import { useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { isBefore, startOfDay, addMonths, subMonths, isSameDay, isToday } from 'date-fns';

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

    let rangePosition = '';
    if (isInRange) {
      const prevDay = new Date(dayDate);
      prevDay.setDate(prevDay.getDate() - 1);
      const nextDay = new Date(dayDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const isRangeStart = tempStart && isSameDay(prevDay, tempStart);
      const isRangeEnd = tempEnd && isSameDay(nextDay, tempEnd);
      const isHoverStart = tempStart && !tempEnd && hoverDate && isSameDay(prevDay, tempStart);
      const isHoverEnd = tempStart && !tempEnd && hoverDate && isSameDay(nextDay, hoverDate);

      if (isRangeStart || isHoverStart) rangePosition = 'range-start';
      else if (isRangeEnd || isHoverEnd) rangePosition = 'range-end';
    }

    if (isPast) {
      return 'text-gray-300 cursor-not-allowed';
    }

    if (isStart || isEnd) {
      return 'bg-[#f9d602] text-gray-900 font-semibold rounded-md';
    }

    if (isInRange) {
      if (rangePosition === 'range-start') {
        return 'bg-[#f9d602]/20 text-gray-900 rounded-l-md';
      }
      if (rangePosition === 'range-end') {
        return 'bg-[#f9d602]/20 text-gray-900 rounded-r-md';
      }
      return 'bg-[#f9d602]/20 text-gray-900';
    }

    if (isCurrentDay) {
      return 'text-[#f9d602] font-semibold hover:bg-[#f9d602]/10 rounded-md';
    }

    return 'text-gray-700 hover:bg-[#f9d602]/10 rounded-md';
  };

  const renderMonth = (date: Date, showNav: boolean = true) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    // Sunday = 0, Monday = 1, etc.
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-9" />);
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
          className={`h-9 w-full flex items-center justify-center text-sm transition-all ${dayClasses}`}
        >
          {d}
        </button>
      );
    }

    return (
      <div className="flex-1 min-w-0">
        {/* Month Header */}
        <div className="flex items-center justify-between mb-4 px-2">
          {showNav ? (
            <>
              <button
                type="button"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <h3 className="text-center font-bold text-gray-700 text-base">
                {monthName}
              </h3>
              <button
                type="button"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </>
          ) : (
            <h3 className="text-center font-bold text-gray-700 text-base w-full">
              {monthName}
            </h3>
          )}
        </div>

        {/* Weekday Headers - Starting SUNDAY */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((d, i) => (
            <div key={i} className="text-[11px] font-medium text-gray-400 h-8 flex items-center justify-center">
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className={`bg-white rounded-xl p-5 shadow-xl border border-gray-100
                    ${singleMonth ? 'w-[320px]' : 'w-[600px]'}`}>
      <div className="flex gap-6">
        {renderMonth(currentMonth, true)}
        {!singleMonth && (
          <>
            <div className="w-[1px] bg-gray-100 self-stretch shrink-0" />
            {renderMonth(nextMonth, false)}
          </>
        )}
      </div>
    </div>
  );
}