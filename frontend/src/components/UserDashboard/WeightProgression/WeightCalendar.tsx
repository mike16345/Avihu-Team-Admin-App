import { IWeighIn } from "@/interfaces/IWeighIns";
import { FC } from "react";
import { type DayContentProps } from "react-day-picker";
import { he } from "date-fns/locale";

import { Calendar } from "../../ui/calendar";
import DateUtils from "@/lib/dateUtils";

type WeighCalendarProps = {
  weighIns: IWeighIn[];
};

export const WeightCalendar: FC<WeighCalendarProps> = ({ weighIns }) => {
  const weighInLookup: Record<string, number> = weighIns.reduce(
    (acc, weighIn) => {
      const date = new Date(weighIn.date);
      acc[DateUtils.formatDate(date, "DD/MM/YYYY")] = weighIn.weight;

      return acc;
    },
    {} as Record<string, number>
  );

  function CustomDayContent({ date }: DayContentProps) {
    const dateString = DateUtils.formatDate(date, "DD/MM/YYYY");
    const weight = weighInLookup[dateString];
    const today = new Date();
    const isPast = date.getTime() <= today.getTime();

    return (
      <span className="flex flex-col items-center justify-center leading-none">
        <span className="text-[13px] text-[#1D2939] dark:text-slate-200">{date.getDate()}</span>
        <span className="mt-1 flex h-1 items-center">
          {weight ? (
            <span className="block h-1 w-1 rounded-full bg-[#7DB7E8]" />
          ) : isPast ? (
            <span className="block h-1 w-1 rounded-full bg-[#DCEAF3]" />
          ) : null}
        </span>
      </span>
    );
  }

  return (
    <div className="w-fit">
      <Calendar
        dir="ltr"
        locale={he}
        components={{ DayContent: CustomDayContent }}
        classNames={{
          day_selected:
            "bg-[#EAF2F7] text-[#1D2939] hover:bg-[#EAF2F7] hover:text-[#1D2939] focus:bg-[#EAF2F7] focus:text-[#1D2939]",
          day_today: "bg-[#F7F9FB] text-[#1D2939] font-semibold",
        }}
      />
    </div>
  );
};
