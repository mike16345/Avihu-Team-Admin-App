"use client";

import { Line, LineChart, XAxis, YAxis } from "recharts";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { IWeighIn } from "@/interfaces/IWeighIns";
import { FC } from "react";
import DateUtils from "@/lib/dateUtils";
import { CardContent } from "@/components/ui/card";

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
  weighIns: IWeighIn[];
};

export const WeightChart: FC<WeighChartProps> = ({ weighIns }) => {
  const minWeighIn = Math.min(...weighIns.map((weight) => weight.weight));

  return (
    <div className="size-full ">
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            data={weighIns}
            margin={{
              top: 20,
              left: 0,
              bottom: 0,
              right: 10,
            }}
          >
            <XAxis
              dataKey="date"
              axisLine={false}
              tickFormatter={(value: string) => {
                const date = DateUtils.convertToDate(value);
                const month = DateUtils.formatDate(date, "DD/MM");

                return month;
              }}
            />
            <YAxis
              dataKey={"weight"}
              axisLine={false}
              width={10}
              tickLine={false}
              domain={[minWeighIn, "auto"]}
            />
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
              strokeWidth={1}
              dot={false}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </div>
  );
};
