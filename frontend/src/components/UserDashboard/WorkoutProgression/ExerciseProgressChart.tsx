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
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
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
            }}
          >
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
              fill="var(--color-mobile)"
              dot
              fillOpacity={0.4}
              stroke="var(--color-mobile)"
              stackId="a"
            />
            <Area
              dataKey="repsDone"
              type="natural"
              dot
              name="חזרות"
              fill="var(--color-desktop)"
              fillOpacity={0.4}
              stroke="var(--color-desktop)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
