import { IWeighIn } from "@/interfaces/IWeighIns";
import { FC } from "react";
import { type DayContentProps } from "react-day-picker";

import { Calendar } from "../../ui/calendar";
import { IoClose } from "react-icons/io5";
import DateUtils from "@/lib/dateUtils";

type WeighCalendarProps = {
  weighIns: IWeighIn[];
};

export const WeightCalendar: FC<WeighCalendarProps> = ({ weighIns }) => {
  const weighInLookup: Record<string, number> = weighIns.reduce((acc, weighIn) => {
    const date = new Date(weighIn.date);
    acc[DateUtils.formatDate(date, "DD/MM/YYYY")] = weighIn.weight;

    return acc;
  }, {} as Record<string, number>);

  function CustomDayContent({ date }: DayContentProps) {
    const dateString = DateUtils.formatDate(date, "DD/MM/YYYY");
    const weight = weighInLookup[dateString];
    const today = new Date();
    const isDateEarlierThanToday = date.getTime() <= today.getTime();

    return (
      <span>
        {date.getDate()}
        {/* Per Avihu: weights need to feel a touch more prominent
            so they read at a glance — bumped from text-[0.60rem] to
            text-[0.7rem] and from default weight to extrabold so
            they stand out from the date number above. */}
        <p className="flex items-center justify-center text-[0.7rem] leading-3 font-extrabold text-primary">
          {weight
            ? weight
            : isDateEarlierThanToday && <IoClose className=" text-destructive" size={12} />}
        </p>
      </span>
    );
  }

  return (
    <div className="w-fit h-[350px] ">
      <Calendar dir="ltr" components={{ DayContent: CustomDayContent }} />
    </div>
  );
};
