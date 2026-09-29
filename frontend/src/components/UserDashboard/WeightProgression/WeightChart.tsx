"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
    color: "#7DB7E8",
  },
  mobile: {
    label: "Mobile",
    color: "#7DB7E8",
  },
} satisfies ChartConfig;

type WeighChartProps = {
  weighIns: IWeighIn[];
};

export const WeightChart: FC<WeighChartProps> = ({ weighIns }) => {
  const cleanData = weighIns.filter(
    (w) => typeof w.weight === "number" && !isNaN(w.weight) && w.weight > 0
  );
  const minWeighIn = cleanData.length > 0 ? Math.min(...cleanData.map((w) => w.weight)) : 0;

  if (cleanData.length === 0) {
    return (
      <div
        dir="rtl"
        className="flex h-full w-full flex-col items-center justify-center rounded-[16px] bg-[#F7F9FB]/50 dark:bg-slate-900/40 px-6 text-center"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#EAF2F7] dark:bg-slate-800">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 stroke-[#7DB7E8]" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 17l4-4 4 4 8-8" />
            <path d="M14 5h5v5" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-[#1D2939] dark:text-slate-100">
          אין מספיק נתוני שקילה עדיין
        </p>
        <p className="mt-1 max-w-xs text-xs leading-relaxed text-[#667085]">
          המשך לעדכן את המשקל שלך כדי לראות את ההתקדמות כאן
        </p>
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
          <AreaChart
            data={cleanData}
            margin={{
              top: 20,
              left: 10,
              bottom: 0,
              right: 35,
            }}
          >
            <defs>
              <linearGradient id="weightArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#7DB7E8" stopOpacity={0.25} />
                <stop offset="100%" stopColor="#7DB7E8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="#E8EDF2" strokeOpacity={0.6} />
            <XAxis
              dataKey="date"
              axisLine={false}
              tickLine={false}
              tickMargin={12}
              tick={{ fill: "#667085", fontSize: 11 }}
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
              tick={{ fill: "#667085", fontSize: 11 }}
              domain={[minWeighIn, "auto"]}
            />
            <ChartTooltip
              cursor={{ stroke: "#E8EDF2" }}
              content={
                <ChartTooltipContent
                  formatter={(weight) => {
                    return (
                      <div dir="rtl" className="w-full flex justify-end items-center gap-1 ">
                        <div className="w-full flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="shrink-0 rounded-full bg-[#7DB7E8] h-2 w-2"></div>
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
            <Area
              dataKey="weight"
              type="monotone"
              stroke="#7DB7E8"
              strokeWidth={2}
              fill="url(#weightArea)"
              dot={{ r: 3, fill: "#fff", stroke: "#7DB7E8", strokeWidth: 2 }}
              activeDot={{ r: 5, fill: "#7DB7E8", stroke: "#fff", strokeWidth: 2 }}
              connectNulls
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </div>
  );
};
