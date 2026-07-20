/**
 * DatePicker — RTL Hebrew date picker with brand-aligned styling.
 *
 * Why a rewrite: the previous implementation rendered the shadcn
 * Calendar with `dir="ltr"` inside a popover that had `h-[400px]`
 * and no width — which on narrow trigger surfaces collapsed the
 * popover into a thin strip showing only the first row of dates
 * pinned to the screen corner. This version uses a proper RTL
 * Hebrew calendar, a brand-tinted trigger input, and a popover
 * sized to the calendar's natural width.
 */
import React, { useEffect, useRef, useState } from "react";
import { addDays, format, isValid, parse, startOfDay } from "date-fns";
import { he } from "date-fns/locale";
import { FaCalendarDay } from "react-icons/fa6";

import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface PresetValues {
  name: string;
  timeInDays: string;
}

interface DatePickerProps {
  presets?: boolean;
  noPrevDates?: boolean;
  presetValues?: PresetValues[];
  selectedDate?: Date;
  onChangeDate: (date: Date) => void;
  triggerTestId?: string;
  presetTriggerTestId?: string;
  /** Optional placeholder when no date is selected. */
  placeholder?: string;
}

const INPUT_FORMATS = ["dd/MM/yyyy", "dd.MM.yyyy", "dd-MM-yyyy", "d/M/yyyy"];
const DISPLAY_FORMAT = "dd/MM/yyyy";

const formatForInput = (value?: Date) => (value ? format(value, DISPLAY_FORMAT) : "");

const parseInputValue = (raw: string): Date | null => {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  for (const pattern of INPUT_FORMATS) {
    const parsed = parse(trimmed, pattern, new Date());
    if (isValid(parsed)) return parsed;
  }
  return null;
};

const DatePicker: React.FC<DatePickerProps> = ({
  presets,
  noPrevDates,
  presetValues,
  selectedDate,
  onChangeDate,
  triggerTestId,
  presetTriggerTestId,
  placeholder = "בחר תאריך",
}) => {
  const [date, setDate] = useState<Date | undefined>(selectedDate);
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState<string>(formatForInput(selectedDate));
  const [month, setMonth] = useState<Date>(selectedDate ?? new Date());
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setDate(selectedDate);
    setInputValue(formatForInput(selectedDate));
    if (selectedDate) setMonth(selectedDate);
  }, [selectedDate]);

  // When the popover opens, snap the visible month to the currently
  // selected date so the calendar doesn't reset to "today's month"
  // after a previous selection.
  useEffect(() => {
    if (open && date) setMonth(date);
  }, [open, date]);

  const commitDate = (next: Date) => {
    setDate(next);
    setInputValue(formatForInput(next));
    setMonth(next);
    onChangeDate(next);
  };

  const handleSelect = (next?: Date) => {
    if (!next) return;
    if (noPrevDates && next < startOfDay(new Date())) return;
    commitDate(next);
    setOpen(false);
  };

  const handleInputBlur = () => {
    const parsed = parseInputValue(inputValue);
    if (parsed && (!noPrevDates || parsed >= startOfDay(new Date()))) {
      commitDate(parsed);

      return;
    }
    setInputValue(formatForInput(date));
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      inputRef.current?.blur();
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <div
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-lg",
          "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
          "px-3 text-sm font-medium text-slate-800 dark:text-slate-100",
          "transition-all hover:border-blue-300 hover:bg-blue-50/40",
          "focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-200/60"
        )}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label="פתח לוח שנה"
            data-testid={triggerTestId}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-blue-500 transition-colors hover:bg-blue-100/60 dark:hover:bg-blue-950/40"
          >
            <FaCalendarDay size={12} />
          </button>
        </PopoverTrigger>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          dir="ltr"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          placeholder={placeholder || "dd/mm/yyyy"}
          className="flex-1 bg-transparent text-center placeholder:text-slate-400 focus:outline-none"
        />
      </div>
      <PopoverContent
        align="start"
        sideOffset={6}
        className={cn(
          "z-50 w-auto rounded-xl border border-slate-200 dark:border-slate-700",
          "bg-white dark:bg-slate-900 p-3 shadow-xl shadow-blue-500/10"
        )}
        dir="rtl"
      >
        {presets && (
          <Select
            onValueChange={(value) => {
              const next = addDays(new Date(), parseInt(value));
              commitDate(next);
              setOpen(false);
            }}
          >
            <SelectTrigger
              data-testid={presetTriggerTestId}
              dir="rtl"
              className="mb-2 h-8 rounded-lg border-blue-100 bg-blue-50/40 text-xs font-semibold text-blue-700"
            >
              <SelectValue placeholder="בחירה מהירה…" />
            </SelectTrigger>
            <SelectContent position="popper" dir="rtl">
              {presetValues?.map((preset) => (
                <SelectItem key={preset.name} value={preset.timeInDays}>
                  {preset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        {/* RTL Hebrew calendar — locale + dir together so the month
            label, weekday header, and day order all read right-to-left.
            The Calendar component (react-day-picker) honours both. */}
        <Calendar
          mode="single"
          dir="rtl"
          locale={he}
          selected={date}
          month={month}
          onMonthChange={setMonth}
          onSelect={handleSelect}
          showOutsideDays
          className="rounded-lg"
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
