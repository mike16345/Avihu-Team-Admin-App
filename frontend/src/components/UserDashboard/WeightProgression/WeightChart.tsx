"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { IWeighIns } from "@/interfaces/IWeighIns";
import { FC } from "react";
import DateUtils from "@/lib/dateUtils";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

type WeighChartProps = {
  weighIns: IWeighIns;
};

export const WeightChart: FC<WeighChartProps> = ({ weighIns }) => {
  return (
    <div className=" size-full">
      <ChartContainer className=" max-h-[400px] w-full" config={chartConfig}>
        <LineChart
          accessibilityLayer
          data={weighIns.weighIns}
          margin={{
            left: 12,
            right: 12,
          }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickFormatter={(value: string) => {
              const date = DateUtils.convertToDate(value);
              const month = DateUtils.formatDate(date, "DD/MM");

              return month;
            }}
          />
          <YAxis dataKey={"weight"} axisLine={false} />
          <ChartTooltip
            cursor={true}
            content={
              <ChartTooltipContent
                labelFormatter={(date: string) => {
                  const convertedDate = DateUtils.convertToDate(date);

                  return DateUtils.formatDate(convertedDate, "DD/MM/YYYY");
                }}
              />
            }
          />
          <Line
            dataKey="weight"
            type="natural"
            stroke="var(--color-desktop)"
            strokeWidth={2}
            dot={{
              fill: "var(--color-desktop)",
            }}
            activeDot={{
              r: 6,
            }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  );
};
