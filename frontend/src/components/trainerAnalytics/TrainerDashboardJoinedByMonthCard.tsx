import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetTrainerDashboardJoinedByMonth } from "@/hooks/queries/analytics/useGetTrainerDashboardJoinedByMonth";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { HEBREW_SHORT_MONTHS } from "./trainerAnalyticsUtils";

const cardClassName =
  "w-full flex-1 rounded-[28px] border border-border/60 bg-card p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] overflow-x-auto";

const chartConfig = {
  trainers: {
    label: "מאמנים",
    color: "hsl(var(--destructive))",
  },
  users: {
    label: "משתמשים",
    color: "hsl(var(--success))",
  },
} satisfies ChartConfig;

const chartHeightClassName = "h-[280px] w-full sm:h-[320px] ";

export const TrainerDashboardJoinedByMonthCard = () => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data, isLoading, isError, error } = useGetTrainerDashboardJoinedByMonth({
    year: selectedYear,
  });

  const chartData = useMemo(() => {
    return (data?.buckets ?? []).map((bucket) => ({
      month: HEBREW_SHORT_MONTHS[bucket.month - 1] ?? String(bucket.month),
      total: bucket.trainers + bucket.users,
      trainers: bucket.trainers,
      users: bucket.users,
    }));
  }, [data]);

  return (
    <section className={cn(cardClassName)} dir="rtl">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 rounded-full bg-primary" />
          <h2 className="text-lg font-semibold text-foreground">מצטרפים לפי חודשים</h2>
        </div>

        <div className="flex items-center gap-2 self-start rounded-xl bg-muted/60 px-3 py-2 text-sm sm:self-auto">
          <button
            type="button"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            onClick={() => setSelectedYear((year) => year + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <span className="min-w-14 text-center font-semibold text-foreground">{selectedYear}</span>

          <button
            type="button"
            className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
            onClick={() => setSelectedYear((year) => year - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className={chartHeightClassName}>
          <Skeleton className="h-full w-full rounded-[20px]" />
        </div>
      ) : isError || !data ? (
        <div className="flex h-[320px] items-center justify-center text-sm text-destructive">
          {error?.message ?? "שגיאה בטעינת גרף המצטרפים"}
        </div>
      ) : (
        <ChartContainer config={chartConfig} className={chartHeightClassName}>
          <BarChart
            accessibilityLayer
            data={chartData}
            margin={{ top: 20, left: 0, right: 0, bottom: 0 }}
            barCategoryGap={18}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />

            <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />

            <YAxis hide domain={[0, "dataMax + 2"]} />

            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;

                const data = payload[0].payload as {
                  total: number;
                  trainers: number;
                  users: number;
                };

                return (
                  <div
                    className="rounded-xl border border-border bg-background px-3 py-2 text-sm shadow-lg"
                    dir="rtl"
                  >
                    <div className="grid gap-1 text-right">
                      <div className="font-medium text-foreground">סה&quot;כ {data.total}</div>

                      <div className="text-muted-foreground">מאמנים: {data.trainers}</div>

                      <div className="text-muted-foreground">משתמשים: {data.users}</div>
                    </div>
                  </div>
                );
              }}
            />

            <Bar
              dataKey="trainers"
              stackId="joined"
              fill="hsl(var(--destructive))"
              radius={[0, 0, 4, 4]}
              maxBarSize={34}
            />

            <Bar
              dataKey="users"
              stackId="joined"
              fill="hsl(var(--success))"
              radius={[4, 4, 0, 0]}
              maxBarSize={34}
            >
              <LabelList dataKey="total" position="top" className="fill-muted-foreground text-xs" />
            </Bar>
          </BarChart>
        </ChartContainer>
      )}
    </section>
  );
};
