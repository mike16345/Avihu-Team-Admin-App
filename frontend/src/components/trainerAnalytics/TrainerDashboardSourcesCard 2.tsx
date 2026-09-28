import { useMemo, useState } from "react";
import { parseISO } from "date-fns";
import { Cell, Pie, PieChart } from "recharts";
import { DateRange } from "react-day-picker";
import DateRangePicker from "@/components/ui/DateRangePicker";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetTrainerDashboardSources } from "@/hooks/queries/analytics/useGetTrainerDashboardSources";
import { cn } from "@/lib/utils";
import {
  formatHebrewRange,
  getDefaultSourceRange,
  getSourceRangeParams,
  TRAINER_SOURCE_COLOR_MAP,
  type TrainerDashboardSourceRangeMode,
} from "./trainerAnalyticsUtils";

const cardClassName =
  "w-full flex-1 rounded-[28px] border border-border/60 bg-card p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]";

const rangeModeLabels: Record<TrainerDashboardSourceRangeMode, string> = {
  month: "חודש",
  year: "שנה",
  custom: "טווח תאריכים",
};

export const TrainerDashboardSourcesCard = () => {
  const [rangeMode, setRangeMode] = useState<TrainerDashboardSourceRangeMode>("month");
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(
    getDefaultSourceRange()
  );

  const params = useMemo(
    () => getSourceRangeParams(rangeMode, selectedRange),
    [rangeMode, selectedRange]
  );

  const { data, isLoading, isError, error } = useGetTrainerDashboardSources(
    params!,
    Boolean(params)
  );

  const headerRangeLabel = useMemo(() => {
    if (!params) {
      return "יש לבחור טווח מלא";
    }

    return formatHebrewRange(parseISO(params.from), parseISO(params.to));
  }, [params]);

  return (
    <section className={cardClassName} dir="rtl">
      <div className="mb-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-1 rounded-full bg-primary" />
          <div className="space-y-1 text-right">
            <h2 className="text-lg font-semibold text-foreground">מקור הגעה של מאמנים</h2>
            <p className="text-sm text-muted-foreground">{headerRangeLabel}</p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          {rangeMode === "custom" ? (
            <DateRangePicker
              selectedRange={selectedRange}
              onChangeRange={setSelectedRange}
              className="h-10 w-full rounded-xl border-none bg-muted sm:w-auto"
            />
          ) : null}

          <div className="flex items-center justify-center rounded-xl bg-muted p-1 sm:justify-end">
            {(Object.keys(rangeModeLabels) as TrainerDashboardSourceRangeMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                className={cn(
                  "rounded-lg px-4 py-1.5 text-sm font-medium transition-colors",
                  rangeMode === mode
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
                onClick={() => setRangeMode(mode)}
              >
                {rangeModeLabels[mode]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-9 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="mx-auto h-[220px] w-[220px] rounded-full sm:h-[240px] sm:w-[240px]" />
        </div>
      ) : isError || !data ? (
        <div className="flex h-[320px] items-center justify-center text-sm text-destructive">
          {error?.message ?? "שגיאה בטעינת מקורות ההגעה"}
        </div>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
          <div className="order-1 flex-1 space-y-4">
            {data.items.map((item) => (
              <div key={item.source} className="space-y-2">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor:
                          TRAINER_SOURCE_COLOR_MAP[item.source] ?? "hsl(var(--muted-foreground))",
                      }}
                    />
                    <span className="text-sm font-medium text-foreground">{item.source}</span>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <span className="font-semibold text-foreground">{item.count}</span>
                    <span className="text-muted-foreground">{item.percentage}%</span>
                  </div>
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor:
                        TRAINER_SOURCE_COLOR_MAP[item.source] ?? "hsl(var(--muted-foreground))",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="order-2 mx-auto shrink-0">
            <div className="relative h-[220px] w-[220px] sm:h-[240px] sm:w-[240px]">
              <PieChart width={240} height={240}>
                <Pie
                  data={data.items}
                  dataKey="count"
                  nameKey="source"
                  innerRadius={68}
                  outerRadius={98}
                  paddingAngle={2}
                  stroke="transparent"
                >
                  {data.items.map((item) => (
                    <Cell
                      key={item.source}
                      fill={TRAINER_SOURCE_COLOR_MAP[item.source] ?? "hsl(var(--muted-foreground))"}
                    />
                  ))}
                </Pie>
              </PieChart>

              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-semibold leading-none text-foreground">
                  {data.total}
                </span>
                <span className="mt-2 text-sm text-muted-foreground">מאמנים</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
