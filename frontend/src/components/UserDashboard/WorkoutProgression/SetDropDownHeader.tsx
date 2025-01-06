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
  const shortMonth = currentDate.toLocaleString("default", { month: "short" }).toUpperCase();

  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <div className="flex flex-col justify-center items-center">
          <h1 className="font-bold bg-secondary rounded-full p-2">{shortMonth.toUpperCase()}</h1>
          <h2 className="text-muted-foreground">{today}</h2>
        </div>
        <div className="flex items-center gap-2 leading-none text-muted-foreground">
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
