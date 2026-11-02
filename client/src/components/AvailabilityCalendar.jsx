import React, { useState, useMemo } from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Sparkles, Check, Zap, Flame, Clock
} from 'lucide-react';

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Format Date object to YYYY-MM-DD in local time
 */
function formatDateToISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function AvailabilityCalendar({ 
  checkIn, 
  checkOut, 
  onSelectDates, 
  basePrice = 2500,
  hotelName = 'Stay'
}) {
  const { formatPrice } = useCurrency();
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [currentMonthDate, setCurrentMonthDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const [hoverDate, setHoverDate] = useState(null);

  // Month navigation
  const nextMonth = () => {
    setCurrentMonthDate((prev) => {
      const next = new Date(prev);
      next.setMonth(next.getMonth() + 1);
      return next;
    });
  };

  const prevMonth = () => {
    setCurrentMonthDate((prev) => {
      const p = new Date(prev);
      p.setMonth(p.getMonth() - 1);
      // Don't navigate before current month
      const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      if (p < currentMonthStart) return prev;
      return p;
    });
  };

  const isPrevDisabled = useMemo(() => {
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    return currentMonthDate <= currentMonthStart;
  }, [currentMonthDate, today]);

  // Build calendar matrix for currentMonthDate
  const calendarDays = useMemo(() => {
    const year = currentMonthDate.getFullYear();
    const month = currentMonthDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days = [];
    // Padding before 1st of month
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    // Days in current month
    for (let day = 1; day <= totalDays; day++) {
      const d = new Date(year, month, day);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }
    return days;
  }, [currentMonthDate]);

  // Determine surge or demand status deterministically
  const getDayStatus = (date) => {
    if (!date) return null;
    const isPast = date < today;
    const isWeekend = date.getDay() === 5 || date.getDay() === 6; // Friday / Saturday
    // Pseudo high-demand on specific intervals (e.g. 15th and 28th of every month)
    const isHighDemand = date.getDate() === 14 || date.getDate() === 28;
    
    // Price calculation with weekend surge
    const surgeMultiplier = isWeekend ? 1.18 : 1.0;
    const dailyPrice = Math.round(Number(basePrice) * surgeMultiplier);

    return {
      isPast,
      isWeekend,
      isHighDemand,
      dailyPrice,
      iso: formatDateToISO(date)
    };
  };

  const handleDateClick = (date) => {
    if (!date || date < today) return;
    const dateStr = formatDateToISO(date);

    if (!checkIn || (checkIn && checkOut)) {
      // First click: sets check-in, clears check-out
      onSelectDates(dateStr, '');
    } else if (checkIn && !checkOut) {
      if (dateStr < checkIn) {
        // Clicked before current checkIn: make it new checkIn
        onSelectDates(dateStr, '');
      } else if (dateStr === checkIn) {
        // Clicked same date: set checkOut to next day
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        onSelectDates(dateStr, formatDateToISO(nextDay));
      } else {
        // Clicked after checkIn: sets checkOut
        onSelectDates(checkIn, dateStr);
      }
    }
  };

  // Quick preset shortcuts
  const applyPreset = (type) => {
    const start = new Date(today);
    const end = new Date(today);

    if (type === 'thisWeekend') {
      const day = start.getDay();
      const diffToFriday = (5 - day + 7) % 7;
      start.setDate(start.getDate() + (diffToFriday === 0 ? 0 : diffToFriday));
      end.setDate(start.getDate() + 2); // Friday to Sunday
    } else if (type === 'nextWeekend') {
      const day = start.getDay();
      const diffToFriday = ((5 - day + 7) % 7) + 7;
      start.setDate(start.getDate() + diffToFriday);
      end.setDate(start.getDate() + 2);
    } else if (type === '3days') {
      start.setDate(start.getDate() + 1);
      end.setDate(start.getDate() + 3);
    } else if (type === 'week') {
      start.setDate(start.getDate() + 1);
      end.setDate(start.getDate() + 7);
    }

    onSelectDates(formatDateToISO(start), formatDateToISO(end));
  };

  const monthLabel = currentMonthDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CalendarIcon size={18} />
            </span>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
              Availability & Pricing Heatmap
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse real-time tariffs and tap any two dates to select your check-in and check-out.
          </p>
        </div>

        {/* Month Navigation Controls */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 min-w-[120px] text-center">
            {monthLabel}
          </span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
            <button
              onClick={prevMonth}
              disabled={isPrevDisabled}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 transition-all"
              title="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Selection Presets */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[11px] font-semibold text-slate-400 uppercase shrink-0">Quick Presets:</span>
        <button
          onClick={() => applyPreset('thisWeekend')}
          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors shrink-0"
        >
          This Weekend
        </button>
        <button
          onClick={() => applyPreset('nextWeekend')}
          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors shrink-0"
        >
          Next Weekend
        </button>
        <button
          onClick={() => applyPreset('3days')}
          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors shrink-0"
        >
          3-Day Getaway
        </button>
        <button
          onClick={() => applyPreset('week')}
          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium transition-colors shrink-0"
        >
          7-Day Staycation
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="space-y-1">
        {/* Weekday Labels */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
          {WEEKDAYS.map((wd, i) => (
            <div 
              key={wd} 
              className={`text-[11px] font-extrabold uppercase py-1 ${
                i === 0 || i === 6 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
              }`}
            >
              {wd}
            </div>
          ))}
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {calendarDays.map((day, idx) => {
            if (!day) {
              return <div key={`empty-${idx}`} className="aspect-square rounded-xl opacity-0" />;
            }

            const status = getDayStatus(day);
            const isStart = status.iso === checkIn;
            const isEnd = status.iso === checkOut;
            const effectiveEnd = checkOut || (checkIn && hoverDate && hoverDate > checkIn ? hoverDate : null);
            const isInRange = checkIn && effectiveEnd && status.iso > checkIn && status.iso < effectiveEnd;
            const isToday = status.iso === formatDateToISO(today);

            // Styling states
            let cellStyle = 'bg-slate-50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-100 hover:border-emerald-400 dark:hover:border-emerald-500';
            let badgeColor = 'text-slate-500 dark:text-slate-400';

            if (status.isPast) {
              cellStyle = 'bg-transparent text-slate-300 dark:text-slate-700 cursor-not-allowed opacity-40';
            } else if (isStart || isEnd) {
              cellStyle = 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500 scale-[1.02] z-10';
              badgeColor = 'text-emerald-100';
            } else if (isInRange) {
              cellStyle = 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border-y border-emerald-200 dark:border-emerald-800/80 rounded-none first:rounded-l-xl last:rounded-r-xl';
              badgeColor = 'text-emerald-700 dark:text-emerald-300 font-semibold';
            } else if (status.isHighDemand) {
              cellStyle = 'bg-rose-50/60 dark:bg-rose-950/20 text-slate-800 dark:text-slate-200 border-dashed border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/40';
              badgeColor = 'text-rose-600 dark:text-rose-400';
            } else if (status.isWeekend) {
              cellStyle = 'bg-amber-50/50 dark:bg-amber-950/20 text-slate-800 dark:text-slate-200 border border-amber-200/50 dark:border-amber-900/30 hover:border-amber-400';
              badgeColor = 'text-amber-700 dark:text-amber-400 font-semibold';
            }

            return (
              <button
                key={status.iso}
                disabled={status.isPast}
                onClick={() => handleDateClick(day)}
                onMouseEnter={() => !status.isPast && setHoverDate(status.iso)}
                onMouseLeave={() => setHoverDate(null)}
                className={`relative aspect-[10/9] sm:aspect-square p-1 sm:p-2 rounded-xl flex flex-col items-center justify-between transition-all duration-150 border border-transparent ${cellStyle}`}
              >
                {/* Date Header / Day number */}
                <div className="w-full flex items-center justify-between">
                  <span className={`text-xs sm:text-sm font-bold ${isStart || isEnd ? 'text-white' : ''}`}>
                    {day.getDate()}
                  </span>
                  {isToday && !isStart && !isEnd && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Today" />
                  )}
                  {status.isHighDemand && !isStart && !isEnd && (
                    <Flame size={10} className="text-rose-500 shrink-0" title="High Demand" />
                  )}
                  {status.isWeekend && !status.isHighDemand && !isStart && !isEnd && (
                    <Zap size={10} className="text-amber-500 shrink-0" title="Weekend Surge" />
                  )}
                </div>

                {/* Per-Night Price Indicator */}
                {!status.isPast && (
                  <span className={`text-[9px] sm:text-[10px] font-medium leading-none truncate max-w-full ${badgeColor}`}>
                    {formatPrice(status.dailyPrice)}
                  </span>
                )}

                {/* Selection Label */}
                {isStart && (
                  <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-100 hidden sm:block">
                    Check-in
                  </span>
                )}
                {isEnd && (
                  <span className="text-[8px] font-bold uppercase tracking-wider text-emerald-100 hidden sm:block">
                    Check-out
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Summary & Heatmap Legend */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        {/* Selected Range Display */}
        <div className="flex items-center gap-2">
          {checkIn ? (
            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {new Date(checkIn).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
              </span>
              <span>→</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {checkOut ? new Date(checkOut).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Select check-out'}
              </span>
            </div>
          ) : (
            <span className="text-slate-400 italic">Click a date to begin reservation selection</span>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center flex-wrap gap-3 text-[11px] text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
            <span>Selected</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>Weekend Surge (+18%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
            <span>Fast Selling</span>
          </div>
        </div>
      </div>
    </div>
  );
}
