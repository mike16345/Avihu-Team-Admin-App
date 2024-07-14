import { IWeighIns } from "@/interfaces/IWeighIns";
import { Card, CardContent } from "../../ui/card";
import { FC } from "react";
import { type DayContentProps } from "react-day-picker";

import { Calendar } from "../../ui/calendar";

type WeighCalendarProps = {
  weighIns: IWeighIns;
};

const formatDate = (date: Date) => date.toISOString().split("T")[0];

export const WeightCalendar: FC<WeighCalendarProps> = ({ weighIns }) => {
  const weighInLookup: Record<string, number> = weighIns.weighIns.reduce((acc, weighIn) => {
    const date = new Date(weighIn.date);
    acc[formatDate(date)] = weighIn.weight;

    return acc;
  }, {} as Record<string, number>);

  function CustomDayContent({ date }: DayContentProps) {
    const dateString = formatDate(date);
    const weight = weighInLookup[dateString];
    console.log("weight: ", weight);
    console.log("date: ", dateString);

    return (
      <div className="relative ">
        {date.getDate()}
        {weight && <p className="text-xs text-primary">{weight}</p>}
      </div>
    );
  }

  return (
    <Card className="flex items-center justify-center h-full">
      <CardContent>
        <Calendar components={{ DayContent: CustomDayContent }} />
      </CardContent>
    </Card>
  );
};
