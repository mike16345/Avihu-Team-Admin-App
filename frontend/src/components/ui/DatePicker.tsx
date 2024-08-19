import React, { useEffect, useState } from "react";
import { addDays, format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { he } from "date-fns/locale";
import { Button } from "@/components/ui/button";
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
}

const DatePicker: React.FC<DatePickerProps> = ({
  presets,
  noPrevDates,
  presetValues,
  selectedDate,
  onChangeDate,
}) => {
  const [date, setDate] = useState<Date>();
  const handleSelect = (date?: Date) => {
    if (!date) return;
    if (noPrevDates) {
      if (date < new Date()) return;
    }

    onChangeDate(date);
  };

  useEffect(() => {
    if (!selectedDate) return;

    setDate(selectedDate);
  }, [selectedDate]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP", { locale: he }) : <span>בחר תאריך</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
        <Select
          onValueChange={(value) => {
            setDate(addDays(new Date(), parseInt(value)));
            onChangeDate(addDays(new Date(), parseInt(value)));
          }}
        >
          {presets && (
            <>
              <SelectTrigger dir="rtl">
                <SelectValue placeholder="בחר" />
              </SelectTrigger>
              <SelectContent position="popper" dir="rtl">
                {presetValues?.map((preset) => (
                  <SelectItem key={preset.name} value={preset.timeInDays}>
                    {preset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </>
          )}
        </Select>
        <div className="rounded-md border">
          <Calendar mode="single" dir="ltr" selected={date} onSelect={handleSelect} />
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
