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
  // Filter out invalid entries (weight 0 / null / NaN) so the line draws cleanly
  const cleanData = weighIns.filter(
    (w) => typeof w.weight === "number" && !isNaN(w.weight) && w.weight > 0
  );
  const minWeighIn = cleanData.length > 0 ? Math.min(...cleanData.map((w) => w.weight)) : 0;

  if (cleanData.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-slate-400">
        אין נתוני שקילה תקינים
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <CardContent
        className="h-full w-full p-0"
        style={{ aspectRatio: "auto" } as React.CSSProperties}
      >
        <ChartContainer
          config={chartConfig}
          className="h-full w-full"
          style={{ aspectRatio: "auto" } as React.CSSProperties}
        >
          <LineChart
            data={cleanData}
            margin={{
              top: 20,
              left: 10,
              bottom: 0,
              right: 35,
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
              reversed
              tickFormatter={(value: string) => {
                const date = DateUtils.convertToDate(value);
                const month = DateUtils.formatDate(date, "DD/MM");

                return month;
              }}
            />
            <YAxis
              dataKey={"weight"}
              orientation="right"
              axisLine={false}
              width={35}
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
              stroke="#0ea5e9"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "#fff", stroke: "#0ea5e9", strokeWidth: 2 }}
              activeDot={{ r: 5, fill: "#0ea5e9" }}
              connectNulls
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </div>
  );
};
