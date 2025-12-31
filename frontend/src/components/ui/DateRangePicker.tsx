import { format } from "date-fns";
import { he } from "date-fns/locale";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DateRangePickerProps {
  selectedRange?: DateRange;
  onChangeRange: (range?: DateRange) => void;
  className?: string;
  placeholder?: string;
}

const DateRangePicker = ({
  selectedRange,
  onChangeRange,
  className,
  placeholder = "בחר טווח תאריכים",
}: DateRangePickerProps) => {
  const formatRange = () => {
    if (!selectedRange?.from) {
      return placeholder;
    }

    if (!selectedRange.to) {
      return format(selectedRange.from, "PPP", { locale: he });
    }

    return `${format(selectedRange.from, "PPP", { locale: he })} - ${format(selectedRange.to, "PPP", {
      locale: he,
    })}`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn("h-9 justify-start gap-2 text-right font-normal", className)}
        >
          <CalendarIcon className="h-4 w-4" />
          <span className={cn(!selectedRange?.from && "text-muted-foreground")}>{formatRange()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="center">
        <Calendar
          initialFocus
          mode="range"
          dir="rtl"
          selected={selectedRange}
          onSelect={onChangeRange}
          numberOfMonths={2}
        />
      </PopoverContent>
    </Popover>
  );
};

export default DateRangePicker;
