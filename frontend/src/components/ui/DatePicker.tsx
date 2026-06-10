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
import React, { useEffect, useState } from "react";
import { addDays, format } from "date-fns";
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
  selectedDate: Date;
  onChangeDate: (date: Date) => void;
  triggerTestId?: string;
  presetTriggerTestId?: string;
  /** Optional placeholder when no date is selected. */
  placeholder?: string;
}

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
  const [date, setDate] = useState<Date>();
  const [open, setOpen] = useState(false);

  const handleSelect = (next?: Date) => {
    if (!next) return;
    if (noPrevDates && next < new Date()) return;
    setDate(next);
    onChangeDate(next);
    setOpen(false);
  };

  useEffect(() => {
    if (!selectedDate) return;
    setDate(selectedDate);
  }, [selectedDate]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-testid={triggerTestId}
          className={cn(
            "flex h-9 w-full items-center justify-between gap-2 rounded-lg",
            "border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900",
            "px-3 text-sm font-medium text-slate-800 dark:text-slate-100",
            "transition-all hover:border-blue-300 hover:bg-blue-50/40",
            "focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200/60",
            !date && "text-slate-400"
          )}
        >
          <FaCalendarDay size={12} className="text-blue-500" />
          <span className="flex-1 text-start">
            {date ? format(date, "PPP", { locale: he }) : placeholder}
          </span>
        </button>
      </PopoverTrigger>
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
              setDate(next);
              onChangeDate(next);
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
          onSelect={handleSelect}
          showOutsideDays
          className="rounded-lg"
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
