"use client";

import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { IRecordedSet } from "@/interfaces/IWorkout";
import { FC } from "react";
import DateUtils from "@/lib/dateUtils";
import { SetProgressTooltip } from "./SetProgressTooltip";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(325 86% 58%)",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(195 92% 52%)",
  },
} satisfies ChartConfig;

interface ExerciseProgressChartProps {
  recordedSets: IRecordedSet[];
  selectedMuscleGroup: string;
  selectedExercise: string;
}

export const ExerciseProgressChart: FC<ExerciseProgressChartProps> = ({
  recordedSets,
  selectedExercise,
  selectedMuscleGroup,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">קבוצת שריר: {selectedMuscleGroup}</CardTitle>
        <CardDescription>תרגיל: {selectedExercise}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={recordedSets}
            margin={{
              left: 12,
              right: 12,
              top: 12,
              bottom: 12,
            }}
          >
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-mobile)" stopOpacity={0.55} />
                <stop offset="95%" stopColor="var(--color-mobile)" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="repsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-desktop)" stopOpacity={0.5} />
                <stop offset="95%" stopColor="var(--color-desktop)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => {
                const date = new Date(value);

                return DateUtils.formatDate(date);
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(_, data) => {
                    return <SetProgressTooltip data={data[0]} />;
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="weight"
              type="natural"
              name="משקל"
              fill="url(#weightGradient)"
              dot={{ r: 2 }}
              activeDot={{ r: 5 }}
              fillOpacity={0.35}
              stroke="var(--color-mobile)"
              strokeWidth={2}
              stackId="a"
            />
            <Area
              dataKey="repsDone"
              type="natural"
              dot={{ r: 2 }}
              activeDot={{ r: 5 }}
              name="חזרות"
              fill="url(#repsGradient)"
              fillOpacity={0.32}
              stroke="var(--color-desktop)"
              strokeWidth={2}
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
