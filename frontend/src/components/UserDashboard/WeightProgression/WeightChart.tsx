"use client";

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

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
    color: "hsl(200 70% 45%)",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(168 65% 42%)",
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
              left: 15,
              bottom: 0,
              right: 10,
            }}
          >
            <defs>
              <linearGradient id="weightStroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--color-desktop)" stopOpacity={0.9} />
                <stop offset="100%" stopColor="var(--color-mobile)" stopOpacity={0.9} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="var(--color-border)" strokeOpacity={0.35} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tickMargin={8}
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
                  formatter={(weight) => {
                    return (
                      <div dir="rtl" className="w-full flex justify-end items-center gap-1 ">
                        <div className="w-full flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div
                              className={`shrink-0 rounded-[2px] border-[--color-border] bg-[var(--color-desktop)] h-2.5 w-2.5`}
                            ></div>
                            <span>משקל</span>
                          </div>
                          <span>{weight}</span>
                        </div>
                      </div>
                    );
                  }}
                  labelFormatter={(date: string) => {
                    const convertedDate = DateUtils.convertToDate(date);

                    return (
                      <div dir="rtl">
                        <span>{DateUtils.formatDate(convertedDate, "DD/MM/YYYY")}</span>
                      </div>
                    );
                  }}
                />
              }
            />
            <Line
              dataKey="weight"
              type="natural"
              stroke="url(#weightStroke)"
              strokeWidth={2}
              dot={{ r: 2 }}
              activeDot={{
                r: 5,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </div>
  );
};
