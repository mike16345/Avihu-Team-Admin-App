import { Button } from "@/components/ui/button";
import { IRecordedSet } from "@/interfaces/IWorkout";
import { FC } from "react";
import { FaChevronDown } from "react-icons/fa";

interface SetDropDownHeaderProps {
  date: string;
  isOpen: boolean;
  setsForDate: IRecordedSet[];
  onToggleDropDown: () => void;
}

const SetDropDownHeader: FC<SetDropDownHeaderProps> = ({
  date,
  isOpen,
  onToggleDropDown,
  setsForDate,
}) => {
  const currentDate = new Date(date);
  const today = currentDate.getDate();
  const year = currentDate.getFullYear();
  const shortMonth = currentDate.toLocaleString("default", { month: "short" }).toUpperCase();

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card/60 px-3 py-2 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col items-center rounded-lg bg-secondary/70 px-3 py-2">
          <h1 className="text-[10px] font-semibold tracking-wide text-muted-foreground">
            {shortMonth.toUpperCase()}
          </h1>
          <h2 className="text-lg font-bold leading-none">{today}</h2>
          <span className="text-[11px] text-muted-foreground">{year}</span>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-secondary/50 px-2 py-1 text-xs font-semibold text-muted-foreground">
          כמות הסטים: {setsForDate.length}
        </div>
        {setsForDate.length && (
          <Button
            onClick={onToggleDropDown}
            variant="ghost"
            size="sm"
            className={`w-9 p-0 transition ${isOpen ? "rotate-180" : "rotate-0"}`}
          >
            <FaChevronDown className="h-4 w-4" />
            <span className="sr-only">Toggle</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default SetDropDownHeader;
