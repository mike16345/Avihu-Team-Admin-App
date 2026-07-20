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
    // Empty state preserves the chart card's footprint and hints at the
    // axes + plot area, so the trainer reads "this is where the trend
    // line will appear" — not "broken component". Dashed plot area +
    // faint gridlines fake the structure of a chart waiting for data.
    return (
      <div
        dir="rtl"
        className="relative h-full w-full overflow-hidden rounded-lg border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/40"
      >
        {/* Faux horizontal gridlines */}
        <div className="absolute inset-x-3 top-6 bottom-6 flex flex-col justify-between">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-px w-full bg-slate-200/70 dark:bg-slate-800/70" />
          ))}
        </div>
        {/* Faux Y-axis labels (right side, RTL) */}
        <div className="absolute inset-y-6 right-2 flex flex-col justify-between text-[10px] text-slate-300 dark:text-slate-700">
          {[100, 90, 80, 70, 60].map((v) => (
            <span key={v}>{v}</span>
          ))}
        </div>
        {/* Faux X-axis labels */}
        <div className="absolute inset-x-8 bottom-1 flex justify-between text-[10px] text-slate-300 dark:text-slate-700">
          {["ינו׳", "פבר׳", "מרץ", "אפר׳", "מאי", "יוני"].map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        {/* Centered empty message */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="rounded-xl bg-white/80 dark:bg-slate-900/80 px-4 py-3 backdrop-blur-sm">
            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">
              אין מעקב שקילה עדיין
            </p>
            <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
              ברגע שהמתאמן יזין שקילה, גרף ההתקדמות יופיע כאן
            </p>
          </div>
        </div>
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
